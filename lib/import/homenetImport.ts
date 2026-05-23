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

/** Matches the vehicles_store_vin_unique constraint (store_id, vin). */
function storeVinKey(storeId: string, vin: string): string {
  return `${storeId}\0${vin}`;
}

function hasStoreVinConflictKey(
  row: HomenetVehicleRow,
): row is HomenetVehicleRow & { store_id: string; vin: string } {
  return Boolean(row.store_id?.trim() && row.vin?.trim());
}

/** Fields refreshed when a vehicle already exists for the same store + VIN. */
function toMergeUpdate(row: HomenetVehicleRow) {
  return {
    internet_price: row.internet_price,
    msrp: row.msrp,
    sale_price: row.sale_price,
    image_urls: row.image_urls,
    image_count: row.image_count,
    has_images: row.has_images,
    data_quality_score: row.data_quality_score,
    updated_at: new Date().toISOString(),
  };
}

async function upsertVehicleBatch(
  supabase: SupabaseClient,
  batch: HomenetVehicleRow[],
): Promise<{ upserted: number; errors: HomenetImportError[] }> {
  const errors: HomenetImportError[] = [];
  let upserted = 0;

  const keyedRows = batch.filter(hasStoreVinConflictKey);
  const unkeyedRows = batch.filter((row) => !hasStoreVinConflictKey(row));

  if (keyedRows.length > 0) {
    const orFilter = keyedRows
      .map((row) => `and(store_id.eq.${row.store_id},vin.eq.${row.vin})`)
      .join(",");

    const { data: existing, error: lookupError } = await supabase
      .from("vehicles")
      .select("store_id, vin")
      .or(orFilter);

    if (lookupError) {
      for (const row of keyedRows) {
        errors.push({
          row: 0,
          import_key: row.import_key,
          message: `Upsert lookup failed: ${lookupError.message}`,
        });
      }
    } else {
      const existingKeys = new Set(
        (existing ?? []).map((row) =>
          storeVinKey(row.store_id as string, row.vin as string),
        ),
      );

      const toInsert = keyedRows.filter(
        (row) => !existingKeys.has(storeVinKey(row.store_id, row.vin)),
      );
      const toUpdate = keyedRows.filter((row) =>
        existingKeys.has(storeVinKey(row.store_id, row.vin)),
      );

      if (toInsert.length > 0) {
        const { data, error } = await supabase
          .from("vehicles")
          .insert(toInsert)
          .select("id");

        if (error) {
          for (const row of toInsert) {
            errors.push({
              row: 0,
              import_key: row.import_key,
              message: `Insert failed: ${error.message}`,
            });
          }
        } else {
          upserted += data?.length ?? toInsert.length;
        }
      }

      if (toUpdate.length > 0) {
        const { data, error } = await supabase
          .from("vehicles")
          .upsert(
            toUpdate.map((row) => ({
              store_id: row.store_id,
              vin: row.vin,
              ...toMergeUpdate(row),
            })),
            { onConflict: "store_id,vin" },
          )
          .select("id");

        if (error) {
          for (const row of toUpdate) {
            errors.push({
              row: 0,
              import_key: row.import_key,
              message: `Update failed: ${error.message}`,
            });
          }
        } else {
          upserted += data?.length ?? toUpdate.length;
        }
      }
    }
  }

  if (unkeyedRows.length > 0) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert(unkeyedRows)
      .select("id");

    if (error) {
      for (const row of unkeyedRows) {
        errors.push({
          row: 0,
          import_key: row.import_key,
          message: `Insert failed: ${error.message}`,
        });
      }
    } else {
      upserted += data?.length ?? unkeyedRows.length;
    }
  }

  return { upserted, errors };
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
    const result = await upsertVehicleBatch(supabase, batch);
    upserted += result.upserted;
    errors.push(...result.errors);
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
