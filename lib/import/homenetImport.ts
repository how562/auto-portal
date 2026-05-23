import type { SupabaseClient } from "@supabase/supabase-js";
import { parseDealerSendFile } from "./dealerSendParse";
import { mapDealerSendRow, type HomenetVehicleRow } from "./dealerSendMap";
import {
  downloadNewestTxtFile,
  getSftpEnvDebug,
  readSftpConfigFromEnv,
} from "./sftpInventory";

const UPSERT_BATCH_SIZE = 50;

export interface HomenetImportError {
  row: number;
  message: string;
  import_key?: string;
}

export interface HomenetImportSummary {
  ok: boolean;
  fileName: string;
  remotePath: string;
  delimiter: string;
  headerCount: number;
  rowsProcessed: number;
  mapped: number;
  skipped: number;
  upserted: number;
  errors: HomenetImportError[];
  /** Present when the import aborts before or during processing. */
  error?: string;
  /** Temporary safe SFTP env debug (failed imports only; never includes the password). */
  sftpHost?: string;
  sftpPort?: number;
  sftpUser?: string;
  hasPassword?: boolean;
  passwordLength?: number;
  sftpPath?: string;
}

/** Full summary shape for fatal errors (SFTP, parse, config). */
export function createFailedImportSummary(
  message: string,
  partial: Partial<HomenetImportSummary> = {},
  includeSftpDebug = true,
): HomenetImportSummary {
  const debug = includeSftpDebug ? getSftpEnvDebug() : null;
  return {
    ok: false,
    error: message,
    fileName: partial.fileName ?? "",
    remotePath: partial.remotePath ?? "",
    delimiter: partial.delimiter ?? "",
    headerCount: partial.headerCount ?? 0,
    rowsProcessed: partial.rowsProcessed ?? 0,
    mapped: partial.mapped ?? 0,
    skipped: partial.skipped ?? 0,
    upserted: partial.upserted ?? 0,
    errors: partial.errors ?? [{ row: 0, message }],
    ...(debug ?? {}),
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

async function fetchStoreNameLookup(
  supabase: SupabaseClient,
): Promise<Map<string, string>> {
  const lookup = new Map<string, string>();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name");

  if (error || !data) return lookup;

  for (const row of data as Array<{ id: string; name: string | null }>) {
    const name = row.name?.trim().toLowerCase();
    if (name && row.id && !lookup.has(name)) {
      lookup.set(name, row.id);
    }
  }
  return lookup;
}

export async function runHomenetInventoryImport(
  supabase: SupabaseClient,
): Promise<HomenetImportSummary> {
  const sftpConfig = readSftpConfigFromEnv();
  const defaultStoreId = process.env.HOMENET_DEFAULT_STORE_ID?.trim() || null;

  const downloaded = await downloadNewestTxtFile(sftpConfig);
  const parsed = parseDealerSendFile(downloaded.content);
  const storeIdByDealerName = await fetchStoreNameLookup(supabase);

  const mappedRows: HomenetVehicleRow[] = [];
  const errors: HomenetImportError[] = [];

  parsed.rows.forEach((raw, index) => {
    try {
      const mapped = mapDealerSendRow(raw, {
        defaultStoreId,
        importSource: "homenet_dealer_send",
        storeIdByDealerName,
      });
      if (!mapped) {
        errors.push({
          row: index + 2,
          message: "Missing VIN and stock number — row skipped",
        });
        return;
      }
      mappedRows.push(mapped);
    } catch (error: unknown) {
      errors.push({
        row: index + 2,
        message:
          error instanceof Error ? error.message : "Failed to map row",
      });
    }
  });

  let upserted = 0;

  for (const batch of chunk(mappedRows, UPSERT_BATCH_SIZE)) {
    const { data, error } = await supabase
      .from("vehicles")
      .upsert(batch, { onConflict: "import_key" })
      .select("id");

    if (error) {
      for (const row of batch) {
        errors.push({
          row: 0,
          import_key: row.import_key,
          message: `Upsert failed: ${error.message}`,
        });
      }
      continue;
    }

    upserted += data?.length ?? batch.length;
  }

  return {
    ok: errors.length === 0 || upserted > 0,
    fileName: downloaded.fileName,
    remotePath: downloaded.remotePath,
    delimiter: parsed.delimiter,
    headerCount: parsed.headers.length,
    rowsProcessed: parsed.rows.length,
    mapped: mappedRows.length,
    skipped: parsed.rows.length - mappedRows.length,
    upserted,
    errors: errors.slice(0, 100),
  };
}
