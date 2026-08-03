import { FeedImportRunsPanel } from "@/components/admin/FeedImportRunsPanel";
import {
  getFeedImportRunWithItems,
  listFeedImportRuns,
  type FeedImportRunItemRow,
} from "@/lib/feedImportRunsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function FeedsScreen() {
  const configured = isSupabaseAdminConfigured();
  let runs: Awaited<ReturnType<typeof listFeedImportRuns>> = [];
  let initialItems: FeedImportRunItemRow[] = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      runs = await listFeedImportRuns({ limit: 25 });
      const latestId = runs[0]?.id;
      if (latestId) {
        const detail = await getFeedImportRunWithItems(latestId);
        initialItems = detail?.items ?? [];
      }
    } catch (error: unknown) {
      loadError =
        error instanceof Error ? error.message : "Failed to load import runs";
    }
  }

  const latest = runs[0] ?? null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feed Imports</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Import run history. Preferred:{" "}
          <code className="rounded bg-[var(--cream)] px-1.5 py-0.5 text-xs">
            /api/import-vauto
          </code>{" "}
          (portal-owned vAuto pipeline). HomeNet rollback (deprecated, retained
          until cutover completes):{" "}
          <code className="rounded bg-[var(--cream)] px-1.5 py-0.5 text-xs">
            /api/import-homenet
          </code>
          . Choose which provider is live under{" "}
          <a
            href="/admin/inventory-sources"
            className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Inventory sources
          </a>
          .
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to view import run history.
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      <FeedImportRunsPanel
        initialRuns={runs}
        initialLatest={latest}
        initialItems={initialItems}
      />
    </div>
  );
}
