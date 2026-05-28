import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedImportRunKind } from "@/lib/inventoryIngestion/types";
import type { InventoryProvider } from "@/lib/inventoryProviders";

export interface RecordInventorySnapshotInput {
  storeId: string;
  inventoryProvider: InventoryProvider;
  activeVehicleCount: number;
  feedImportRunId?: string | null;
  storageRef?: string | null;
  /** intake runs may pass row estimate before vehicles exist */
  metadata?: Record<string, unknown>;
}

/** Point-in-time count per store + provider for shadow testing and rollback analysis. */
export async function recordInventorySnapshot(
  supabase: SupabaseClient,
  input: RecordInventorySnapshotInput,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("inventory_snapshots")
    .insert({
      store_id: input.storeId,
      inventory_provider: input.inventoryProvider,
      feed_import_run_id: input.feedImportRunId ?? null,
      active_vehicle_count: input.activeVehicleCount,
      storage_ref: input.storageRef ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.warn(`inventory_snapshots insert: ${error.message}`);
    return null;
  }
  return typeof data?.id === "string" ? data.id : null;
}

export async function recordInventorySnapshotsForStores(
  supabase: SupabaseClient,
  entries: RecordInventorySnapshotInput[],
): Promise<void> {
  if (entries.length === 0) return;

  const rows = entries.map((entry) => ({
    store_id: entry.storeId,
    inventory_provider: entry.inventoryProvider,
    feed_import_run_id: entry.feedImportRunId ?? null,
    active_vehicle_count: entry.activeVehicleCount,
    storage_ref: entry.storageRef ?? null,
  }));

  const { error } = await supabase.from("inventory_snapshots").insert(rows);
  if (error) {
    console.warn(`inventory_snapshots bulk insert: ${error.message}`);
  }
}

/** After import: snapshot actual active vehicle counts from DB per store. */
export async function snapshotActiveCountsFromDb(
  supabase: SupabaseClient,
  options: {
    inventoryProvider: InventoryProvider;
    feedImportRunId?: string | null;
    storeIds?: string[];
    runKind?: FeedImportRunKind;
  },
): Promise<void> {
  const { inventoryProvider, feedImportRunId, storeIds } = options;

  let query = supabase
    .from("vehicles")
    .select("store_id")
    .eq("status", "active")
    .eq("inventory_provider", inventoryProvider)
    .not("store_id", "is", null);

  if (storeIds?.length) {
    query = query.in("store_id", storeIds);
  }

  const { data, error } = await query;
  if (error) {
    console.warn(`snapshotActiveCountsFromDb: ${error.message}`);
    return;
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const sid = row.store_id as string;
    counts.set(sid, (counts.get(sid) ?? 0) + 1);
  }

  const entries: RecordInventorySnapshotInput[] = [];
  if (storeIds?.length) {
    for (const storeId of storeIds) {
      entries.push({
        storeId,
        inventoryProvider,
        activeVehicleCount: counts.get(storeId) ?? 0,
        feedImportRunId,
      });
    }
  } else {
    counts.forEach((activeVehicleCount, storeId) => {
      entries.push({
        storeId,
        inventoryProvider,
        activeVehicleCount,
        feedImportRunId,
      });
    });
  }

  await recordInventorySnapshotsForStores(supabase, entries);
}
