import type { SupabaseClient } from "@supabase/supabase-js";
import { parseDealerSendFile } from "./dealerSendParse";
import { mapDealerSendRow, type HomenetVehicleRow } from "./dealerSendMap";
import { downloadNewestTxtFile, readSftpConfigFromEnv } from "./sftpInventory";

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
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

export async function runHomenetInventoryImport(
  supabase: SupabaseClient,
): Promise<HomenetImportSummary> {
  const sftpConfig = readSftpConfigFromEnv();
  const defaultStoreId = process.env.HOMENET_DEFAULT_STORE_ID?.trim() || null;

  const downloaded = await downloadNewestTxtFile(sftpConfig);
  const parsed = parseDealerSendFile(downloaded.content);

  const mappedRows: HomenetVehicleRow[] = [];
  const errors: HomenetImportError[] = [];

  parsed.rows.forEach((raw, index) => {
    try {
      const mapped = mapDealerSendRow(raw, {
        defaultStoreId,
        importSource: "homenet_dealer_send",
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
