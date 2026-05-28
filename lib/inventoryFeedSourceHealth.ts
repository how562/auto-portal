import type { InventoryProvider } from "@/lib/inventoryProviders";
import { compareProviderCounts } from "@/lib/inventorySourceSwitch";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export interface ProviderFeedHealth {
  lastSuccessfulImportAt: string | null;
  lastRunStatus: string | null;
  lastRunKind: string | null;
  lastFileName: string | null;
}

export interface StoreProviderComparison {
  homenetCount: number;
  vautoCount: number;
  difference: number;
  mismatchWarning: boolean;
  dramaticMismatch: boolean;
}

function healthKey(storeId: string, provider: InventoryProvider): string {
  return `${storeId}:${provider}`;
}

/** Latest successful/partial runs and files per store + provider. */
export async function loadFeedHealthIndex(): Promise<
  Map<string, ProviderFeedHealth>
> {
  const supabase = getSupabaseAdmin();
  const index = new Map<string, ProviderFeedHealth>();

  const { data: runs } = await supabase
    .from("feed_import_runs")
    .select(
      "inventory_provider, store_id, status, run_kind, started_at, completed_at",
    )
    .in("status", ["success", "partial"])
    .order("started_at", { ascending: false })
    .limit(250);

  for (const run of runs ?? []) {
    const provider = run.inventory_provider as InventoryProvider;
    if (!provider) continue;
    const storeId = (run.store_id as string | null) ?? "*";
    const key = healthKey(storeId, provider);
    if (index.has(key)) continue;
    index.set(key, {
      lastSuccessfulImportAt: run.completed_at
        ? String(run.completed_at)
        : String(run.started_at ?? ""),
      lastRunStatus: String(run.status ?? ""),
      lastRunKind: String(run.run_kind ?? ""),
      lastFileName: null,
    });
    const globalKey = healthKey("*", provider);
    if (!index.has(globalKey)) {
      index.set(globalKey, index.get(key)!);
    }
  }

  const { data: archives } = await supabase
    .from("raw_feed_archives")
    .select("store_id, inventory_provider, file_name, received_at")
    .order("received_at", { ascending: false })
    .limit(250);

  for (const archive of archives ?? []) {
    const provider = archive.inventory_provider as InventoryProvider;
    const storeId = (archive.store_id as string | null) ?? "*";
    const key = healthKey(storeId, provider);
    const existing = index.get(key) ?? {
      lastSuccessfulImportAt: null,
      lastRunStatus: null,
      lastRunKind: null,
      lastFileName: null,
    };
    if (!existing.lastFileName) {
      existing.lastFileName = archive.file_name as string;
      index.set(key, existing);
    }
    const globalKey = healthKey("*", provider);
    if (!index.get(globalKey)?.lastFileName) {
      index.set(globalKey, { ...existing, lastFileName: archive.file_name as string });
    }
  }

  const { data: items } = await supabase
    .from("feed_import_run_items")
    .select("file_name, store_id, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  for (const item of items ?? []) {
    const storeId = item.store_id as string | null;
    if (!storeId) continue;
    const key = healthKey(storeId, "homenet");
    const existing = index.get(key);
    if (existing && !existing.lastFileName) {
      existing.lastFileName = item.file_name as string;
    }
  }

  return index;
}

export function resolveFeedHealth(
  index: Map<string, ProviderFeedHealth>,
  storeId: string,
  provider: InventoryProvider,
): ProviderFeedHealth {
  return (
    index.get(healthKey(storeId, provider)) ??
    index.get(healthKey("*", provider)) ?? {
      lastSuccessfulImportAt: null,
      lastRunStatus: null,
      lastRunKind: null,
      lastFileName: null,
    }
  );
}

export function buildStoreComparison(
  homenetCount: number,
  vautoCount: number,
): StoreProviderComparison {
  const cmp = compareProviderCounts(homenetCount, vautoCount);
  return {
    homenetCount: cmp.homenetCount,
    vautoCount: cmp.vautoCount,
    difference: cmp.difference,
    mismatchWarning:
      cmp.homenetCount > 0 && cmp.vautoCount > 0 && cmp.difference > 0,
    dramaticMismatch: cmp.dramaticMismatch,
  };
}
