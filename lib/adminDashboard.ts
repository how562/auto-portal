import { isAdminProtectionEnabled } from "@/lib/adminAuthConfig";
import { listAllSitePages } from "@/lib/cmsAdmin";
import { listFeedImportRuns, type FeedImportRunRow } from "@/lib/feedImportRunsAdmin";
import { listFeedFileMappingsAdmin } from "@/lib/feedFileMappingsAdmin";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export type WorkspaceLight = "green" | "red";

export interface WorkspaceStatusItem {
  id: string;
  label: string;
  light: WorkspaceLight;
  summary: string;
  detail: string;
  href: string;
}

export interface AdminWorkspaceSnapshot {
  checkedAt: string;
  allClear: boolean;
  items: WorkspaceStatusItem[];
}

const FEED_STALE_MS = 7 * 24 * 60 * 60 * 1000;
const FEED_RUNNING_MAX_MS = 3 * 60 * 60 * 1000;

function formatWhen(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function evaluateFeedStatus(
  latest: FeedImportRunRow | null,
  configured: boolean,
): WorkspaceStatusItem {
  const base = {
    id: "feed",
    label: "Inventory feed",
    href: "/admin/feeds",
  };

  if (!configured) {
    return {
      ...base,
      light: "red",
      summary: "Cannot verify feed",
      detail: "Add SUPABASE_SERVICE_ROLE_KEY to load import history.",
    };
  }

  if (!latest) {
    return {
      ...base,
      light: "red",
      summary: "No imports yet",
      detail: "Run the HomeNet import once feeds are connected.",
    };
  }

  if (latest.status === "running") {
    const started = new Date(latest.started_at).getTime();
    const stuck =
      Number.isFinite(started) && Date.now() - started > FEED_RUNNING_MAX_MS;
    return {
      ...base,
      light: "red",
      summary: stuck ? "Import appears stuck" : "Import in progress",
      detail: stuck
        ? `Started ${formatWhen(latest.started_at)} — check /api/import-homenet.`
        : `Started ${formatWhen(latest.started_at)}.`,
    };
  }

  const completedAt = latest.completed_at
    ? new Date(latest.completed_at).getTime()
    : NaN;
  const stale =
    Number.isFinite(completedAt) && Date.now() - completedAt > FEED_STALE_MS;

  if (latest.status === "success" && latest.files_failed === 0 && !stale) {
    return {
      ...base,
      light: "green",
      summary: "Feed is good",
      detail: `Last run ${formatWhen(latest.completed_at)} · ${latest.total_upserted.toLocaleString()} vehicles updated.`,
    };
  }

  const reasons: string[] = [];
  if (latest.status === "failed") reasons.push("last run failed");
  if (latest.status === "partial") reasons.push("partial success");
  if (latest.files_failed > 0)
    reasons.push(`${latest.files_failed} file(s) failed`);
  if (stale) reasons.push("last successful run is over 7 days old");
  if (latest.error_message) reasons.push(latest.error_message);

  return {
    ...base,
    light: "red",
    summary: "Feed needs attention",
    detail:
      reasons.join(" · ") ||
      `Last run ${formatWhen(latest.completed_at)} (${latest.status}).`,
  };
}

export async function getAdminWorkspaceSnapshot(): Promise<AdminWorkspaceSnapshot> {
  const configured = isSupabaseAdminConfigured();
  const items: WorkspaceStatusItem[] = [];

  let latestRun: FeedImportRunRow | null = null;
  let vehicleCount = 0;
  let activeMappings = 0;
  let publishedPages = 0;

  if (configured) {
    try {
      const supabase = getSupabaseAdmin();
      const [runs, mappings, pages, vehicleResult] = await Promise.all([
        listFeedImportRuns(1).catch(() => [] as FeedImportRunRow[]),
        listFeedFileMappingsAdmin().catch(() => []),
        listAllSitePages().catch(() => []),
        supabase
          .from("vehicles")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
      ]);

      latestRun = runs[0] ?? null;
      activeMappings = mappings.filter((m) => m.is_active).length;
      publishedPages = pages.filter((p) => p.status === "published").length;
      vehicleCount = vehicleResult.count ?? 0;
    } catch {
      /* individual checks fall through to red states */
    }
  }

  items.push(evaluateFeedStatus(latestRun, configured));

  items.push({
    id: "mappings",
    label: "Feed file mapping",
    light:
      !configured || activeMappings === 0 ? "red" : "green",
    summary:
      !configured
        ? "Cannot verify mappings"
        : activeMappings === 0
          ? "No active mappings"
          : "Mappings configured",
    detail: !configured
      ? "Service role required to read feed_file_mappings."
      : activeMappings === 0
        ? "Add patterns in Feed Mapping so imports route to stores."
        : `${activeMappings} active file pattern(s) ready for import.`,
    href: "/admin/feed-mapping",
  });

  items.push({
    id: "inventory",
    label: "Live inventory",
    light: !configured || vehicleCount === 0 ? "red" : "green",
    summary:
      !configured
        ? "Cannot count vehicles"
        : vehicleCount === 0
          ? "No active vehicles"
          : "Inventory on site",
    detail: !configured
      ? "Connect Supabase to count published stock."
      : vehicleCount === 0
        ? "Shoppers will see empty results until a feed import completes."
        : `${vehicleCount.toLocaleString()} active vehicle(s) in the catalog.`,
    href: "/admin/inventory",
  });

  items.push({
    id: "content",
    label: "Site content",
    light: !configured || publishedPages === 0 ? "red" : "green",
    summary:
      !configured
        ? "Cannot verify pages"
        : publishedPages === 0
          ? "No published pages"
          : "Content published",
    detail: !configured
      ? "Service role required to list CMS pages."
      : publishedPages === 0
        ? "Publish at least the homepage in Pages when ready."
        : `${publishedPages} published page(s) in the CMS.`,
    href: "/admin/pages",
  });

  items.push({
    id: "admin",
    label: "Admin protection",
    light: isAdminProtectionEnabled() ? "green" : "red",
    summary: isAdminProtectionEnabled()
      ? "CMS password enabled"
      : "Admin routes open",
    detail: isAdminProtectionEnabled()
      ? "CMS_ADMIN_SECRET is set — admin API and pages require sign-in."
      : "Set CMS_ADMIN_SECRET in production to require a password.",
    href: "/admin/login",
  });

  const allClear = items.every((item) => item.light === "green");

  return {
    checkedAt: new Date().toISOString(),
    allClear,
    items,
  };
}
