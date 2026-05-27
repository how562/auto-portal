import type { SupabaseClient } from "@supabase/supabase-js";
import type { FeedImportRunKind } from "@/lib/inventoryIngestion/types";
import type { InventoryProvider } from "@/lib/inventoryProviders";
import type {
  HomenetFileImportSummary,
  HomenetImportSummary,
} from "@/lib/import/homenetImport";

export type FeedImportRunStatus = "running" | "success" | "partial" | "failed";

export interface StartFeedImportRunOptions {
  inventoryProvider?: InventoryProvider;
  runKind?: FeedImportRunKind;
  storeId?: string | null;
  inventoryFeedSourceId?: string | null;
}

function deriveRunStatus(summary: HomenetImportSummary): FeedImportRunStatus {
  if (summary.error && summary.filesProcessed === 0) return "failed";
  if (summary.filesFailed > 0) return "partial";
  if (summary.filesSkipped === summary.filesProcessed && summary.filesProcessed > 0) {
    return "partial";
  }
  if (summary.ok) return "success";
  return "partial";
}

function fileItemStatus(file: HomenetFileImportSummary): string {
  if (file.skipped) return "skipped";
  if (file.ok) return "success";
  return "failed";
}

export async function startFeedImportRun(
  supabase: SupabaseClient,
  options: StartFeedImportRunOptions = {},
): Promise<string | null> {
  const { data, error } = await supabase
    .from("feed_import_runs")
    .insert({
      status: "running",
      inventory_provider: options.inventoryProvider ?? "homenet",
      run_kind: options.runKind ?? "import",
      store_id: options.storeId ?? null,
      inventory_feed_source_id: options.inventoryFeedSourceId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.warn(`feed_import_runs insert: ${error.message}`);
    return null;
  }
  return typeof data?.id === "string" ? data.id : null;
}

export async function completeFeedImportRun(
  supabase: SupabaseClient,
  runId: string | null,
  summary: HomenetImportSummary,
): Promise<void> {
  if (!runId) return;

  const status = deriveRunStatus(summary);
  const { error: runError } = await supabase
    .from("feed_import_runs")
    .update({
      completed_at: new Date().toISOString(),
      status,
      files_processed: summary.filesProcessed,
      files_succeeded: summary.filesSucceeded,
      files_failed: summary.filesFailed,
      files_skipped: summary.filesSkipped,
      total_upserted: summary.totalUpserted,
      error_message: summary.error ?? null,
    })
    .eq("id", runId);

  if (runError) {
    console.warn(`feed_import_runs update: ${runError.message}`);
    return;
  }

  if (summary.files.length === 0) return;

  const items = summary.files.map((file) => ({
    run_id: runId,
    file_name: file.fileName,
    store_id: file.storeId ?? null,
    store_name: file.storeName ?? null,
    status: fileItemStatus(file),
    rows_processed: file.rowsProcessed,
    upserted: file.upserted,
    skipped: file.skippedRows,
    error_message:
      file.errors.length > 0
        ? file.errors
            .slice(0, 3)
            .map((e) => e.message)
            .join("; ")
        : null,
    skip_reason: file.skipReason ?? null,
    store_mapping_source: file.storeMappingSource ?? null,
  }));

  const { error: itemsError } = await supabase
    .from("feed_import_run_items")
    .insert(items);

  if (itemsError) {
    console.warn(`feed_import_run_items insert: ${itemsError.message}`);
  }
}

export async function failFeedImportRun(
  supabase: SupabaseClient,
  runId: string | null,
  message: string,
  partial?: Partial<HomenetImportSummary>,
): Promise<void> {
  if (!runId) return;

  await supabase
    .from("feed_import_runs")
    .update({
      completed_at: new Date().toISOString(),
      status: "failed",
      error_message: message,
      files_processed: partial?.filesProcessed ?? 0,
      files_succeeded: partial?.filesSucceeded ?? 0,
      files_failed: partial?.filesFailed ?? 0,
      files_skipped: partial?.filesSkipped ?? 0,
      total_upserted: partial?.totalUpserted ?? 0,
    })
    .eq("id", runId);
}
