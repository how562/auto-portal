import { getSupabaseAdmin } from "./supabaseAdmin";
import type { FeedImportRunKind } from "./inventoryIngestion/types";
import type { InventoryProvider } from "./inventoryProviders";

const RUN_SELECT =
  "id, started_at, completed_at, status, files_processed, files_succeeded, files_failed, files_skipped, total_upserted, error_message, created_at, inventory_provider, run_kind, store_id";

const ITEM_SELECT =
  "id, run_id, file_name, store_id, store_name, status, rows_processed, upserted, skipped, error_message, skip_reason, store_mapping_source, created_at";

export interface FeedImportRunRow {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  files_processed: number;
  files_succeeded: number;
  files_failed: number;
  files_skipped: number;
  total_upserted: number;
  error_message: string | null;
  created_at: string;
  inventory_provider: InventoryProvider | null;
  run_kind: FeedImportRunKind | null;
  store_id: string | null;
}

export interface FeedImportRunItemRow {
  id: string;
  run_id: string;
  file_name: string;
  store_id: string | null;
  store_name: string | null;
  status: string;
  rows_processed: number;
  upserted: number;
  skipped: number;
  error_message: string | null;
  skip_reason: string | null;
  store_mapping_source: string | null;
  created_at: string;
}

export interface ListFeedImportRunsOptions {
  limit?: number;
  inventoryProvider?: InventoryProvider | "all";
  runKind?: FeedImportRunKind | "all";
}

function normalizeRun(row: Record<string, unknown>): FeedImportRunRow | null {
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;

  const provider = row.inventory_provider;
  const runKind = row.run_kind;

  return {
    id,
    started_at: String(row.started_at ?? ""),
    completed_at:
      row.completed_at != null ? String(row.completed_at) : null,
    status: typeof row.status === "string" ? row.status : "unknown",
    files_processed: Number(row.files_processed) || 0,
    files_succeeded: Number(row.files_succeeded) || 0,
    files_failed: Number(row.files_failed) || 0,
    files_skipped: Number(row.files_skipped) || 0,
    total_upserted: Number(row.total_upserted) || 0,
    error_message:
      typeof row.error_message === "string" ? row.error_message : null,
    created_at: String(row.created_at ?? ""),
    inventory_provider:
      provider === "homenet" || provider === "vauto" ? provider : null,
    run_kind:
      runKind === "import" || runKind === "intake" || runKind === "reconcile"
        ? runKind
        : null,
    store_id: typeof row.store_id === "string" ? row.store_id : null,
  };
}

function normalizeItem(row: Record<string, unknown>): FeedImportRunItemRow | null {
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;

  return {
    id,
    run_id: typeof row.run_id === "string" ? row.run_id : "",
    file_name: typeof row.file_name === "string" ? row.file_name : "",
    store_id: typeof row.store_id === "string" ? row.store_id : null,
    store_name: typeof row.store_name === "string" ? row.store_name : null,
    status: typeof row.status === "string" ? row.status : "unknown",
    rows_processed: Number(row.rows_processed) || 0,
    upserted: Number(row.upserted) || 0,
    skipped: Number(row.skipped) || 0,
    error_message:
      typeof row.error_message === "string" ? row.error_message : null,
    skip_reason: typeof row.skip_reason === "string" ? row.skip_reason : null,
    store_mapping_source:
      typeof row.store_mapping_source === "string"
        ? row.store_mapping_source
        : null,
    created_at: String(row.created_at ?? ""),
  };
}

export async function listFeedImportRuns(
  options: ListFeedImportRunsOptions = {},
): Promise<FeedImportRunRow[]> {
  const limit = Math.min(100, Math.max(1, options.limit ?? 25));
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("feed_import_runs")
    .select(RUN_SELECT)
    .order("started_at", { ascending: false })
    .limit(limit);

  if (options.inventoryProvider && options.inventoryProvider !== "all") {
    query = query.eq("inventory_provider", options.inventoryProvider);
  }
  if (options.runKind && options.runKind !== "all") {
    query = query.eq("run_kind", options.runKind);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load import runs: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => normalizeRun(row as Record<string, unknown>))
    .filter((row): row is FeedImportRunRow => row != null);
}

export async function getFeedImportRunWithItems(runId: string): Promise<{
  run: FeedImportRunRow;
  items: FeedImportRunItemRow[];
} | null> {
  const supabase = getSupabaseAdmin();
  const id = runId.trim();
  if (!id) return null;

  const { data: runData, error: runError } = await supabase
    .from("feed_import_runs")
    .select(RUN_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (runError) {
    throw new Error(`Failed to load import run: ${runError.message}`);
  }
  if (!runData) return null;

  const run = normalizeRun(runData as Record<string, unknown>);
  if (!run) return null;

  const { data: itemsData, error: itemsError } = await supabase
    .from("feed_import_run_items")
    .select(ITEM_SELECT)
    .eq("run_id", id)
    .order("file_name", { ascending: true });

  if (itemsError) {
    throw new Error(`Failed to load import run items: ${itemsError.message}`);
  }

  const items = (itemsData ?? [])
    .map((row) => normalizeItem(row as Record<string, unknown>))
    .filter((row): row is FeedImportRunItemRow => row != null);

  return { run, items };
}
