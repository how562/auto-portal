import type { SupabaseClient } from "@supabase/supabase-js";
import type { InventoryProvider } from "@/lib/inventoryProviders";
import type {
  RawFeedParseStatus,
  RawFeedStorageKind,
} from "@/lib/inventoryIngestion/types";
import { detectFeedFileFormat } from "@/lib/import/sftpInventory";

export interface RawFeedArchiveInput {
  feedImportRunId?: string | null;
  inventoryFeedSourceId?: string | null;
  storeId?: string | null;
  inventoryProvider: InventoryProvider;
  fileName: string;
  remotePath?: string | null;
  byteSize?: number | null;
  storageKind?: RawFeedStorageKind;
  storagePath?: string | null;
  parseStatus?: RawFeedParseStatus;
  errorMessage?: string | null;
  metadata?: Record<string, unknown>;
}

export async function insertRawFeedArchive(
  supabase: SupabaseClient,
  input: RawFeedArchiveInput,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("raw_feed_archives")
    .insert({
      feed_import_run_id: input.feedImportRunId ?? null,
      inventory_feed_source_id: input.inventoryFeedSourceId ?? null,
      store_id: input.storeId ?? null,
      inventory_provider: input.inventoryProvider,
      file_name: input.fileName,
      remote_path: input.remotePath ?? null,
      file_format: detectFeedFileFormat(input.fileName),
      byte_size: input.byteSize ?? null,
      storage_kind: input.storageKind ?? "sftp_retained",
      storage_path: input.storagePath ?? input.remotePath ?? null,
      parse_status: input.parseStatus ?? "pending",
      error_message: input.errorMessage ?? null,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();

  if (error) {
    console.warn(`raw_feed_archives insert: ${error.message}`);
    return null;
  }
  return typeof data?.id === "string" ? data.id : null;
}

export async function logInventoryImportFailure(
  supabase: SupabaseClient,
  input: {
    feedImportRunId?: string | null;
    rawFeedArchiveId?: string | null;
    inventoryProvider: InventoryProvider;
    storeId?: string | null;
    failureScope: "run" | "file" | "row";
    fileName?: string | null;
    rowNumber?: number | null;
    vin?: string | null;
    importKey?: string | null;
    errorCode?: string | null;
    errorMessage: string;
  },
): Promise<void> {
  const { error } = await supabase.from("inventory_import_failures").insert({
    feed_import_run_id: input.feedImportRunId ?? null,
    raw_feed_archive_id: input.rawFeedArchiveId ?? null,
    inventory_provider: input.inventoryProvider,
    store_id: input.storeId ?? null,
    failure_scope: input.failureScope,
    file_name: input.fileName ?? null,
    row_number: input.rowNumber ?? null,
    vin: input.vin ?? null,
    import_key: input.importKey ?? null,
    error_code: input.errorCode ?? null,
    error_message: input.errorMessage,
  });

  if (error) {
    console.warn(`inventory_import_failures insert: ${error.message}`);
  }
}
