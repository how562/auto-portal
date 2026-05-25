import type { SupabaseClient } from "@supabase/supabase-js";
import { parseDealerSendFile } from "./dealerSendParse";
import { mapDealerSendRow, type HomenetVehicleRow } from "./dealerSendMap";
import {
  downloadAllInventoryFiles,
  getSftpEnvDebug,
  readSftpConfigFromEnv,
  type DownloadedInventoryFile,
} from "./sftpInventory";
import { loadActiveFeedFileMappings } from "@/lib/feedFileMappings";
import {
  completeFeedImportRun,
  failFeedImportRun,
  startFeedImportRun,
} from "@/lib/feedImportRunLog";
import {
  buildStoreLookupTables,
  isResolvedStoreMapping,
  resolveStoreForFile,
  type StoreLookupTables,
  type StoreMappingSource,
} from "./storeMapping";

const UPSERT_BATCH_SIZE = 50;

export interface HomenetImportError {
  row: number;
  message: string;
  import_key?: string;
}

export interface HomenetFileImportSummary {
  ok: boolean;
  fileName: string;
  remotePath: string;
  skipped: boolean;
  skipReason?: string;
  storeId?: string;
  storeName?: string;
  storeMappingSource?: StoreMappingSource;
  delimiter: string;
  headerCount: number;
  rowsProcessed: number;
  mapped: number;
  skippedRows: number;
  upserted: number;
  errors: HomenetImportError[];
}

export interface HomenetImportSummary {
  ok: boolean;
  filesProcessed: number;
  filesSkipped: number;
  filesSucceeded: number;
  filesFailed: number;
  totalUpserted: number;
  files: HomenetFileImportSummary[];
  /** Present when the import aborts before processing any file. */
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
    filesProcessed: partial.filesProcessed ?? 0,
    filesSkipped: partial.filesSkipped ?? 0,
    filesSucceeded: partial.filesSucceeded ?? 0,
    filesFailed: partial.filesFailed ?? 0,
    totalUpserted: partial.totalUpserted ?? 0,
    files: partial.files ?? [{ ...emptyFileSummary(), skipped: true, skipReason: message, errors: [{ row: 0, message }] }],
    ...(debug ?? {}),
  };
}

function emptyFileSummary(): HomenetFileImportSummary {
  return {
    ok: false,
    fileName: "",
    remotePath: "",
    skipped: false,
    delimiter: "",
    headerCount: 0,
    rowsProcessed: 0,
    mapped: 0,
    skippedRows: 0,
    upserted: 0,
    errors: [],
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

function hasStoreVinKey(
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
    dealer_name: row.dealer_name,
    updated_at: new Date().toISOString(),
  };
}

async function upsertVehicleBatch(
  supabase: SupabaseClient,
  batch: HomenetVehicleRow[],
): Promise<{ upserted: number; errors: HomenetImportError[] }> {
  const errors: HomenetImportError[] = [];
  let upserted = 0;

  const keyedRows = batch.filter(hasStoreVinKey);
  const unkeyedRows = batch.filter((row) => !hasStoreVinKey(row));

  for (const row of unkeyedRows) {
    errors.push({
      row: 0,
      import_key: row.import_key,
      message: !row.store_id?.trim()
        ? "Missing store_id — row skipped"
        : "Missing VIN — row skipped (upsert requires store_id + vin)",
    });
  }

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

  return { upserted, errors };
}

async function fetchStoreLookup(
  supabase: SupabaseClient,
): Promise<StoreLookupTables> {
  const [{ data, error }, dbFileMap] = await Promise.all([
    supabase.from("stores").select("id, name"),
    loadActiveFeedFileMappings(supabase),
  ]);

  if (error || !data) {
    throw new Error(`Failed to load stores for import mapping: ${error?.message ?? "unknown"}`);
  }

  return buildStoreLookupTables(
    (data ?? []) as Array<{ id: string; name: string | null }>,
    dbFileMap,
  );
}

async function importSingleInventoryFile(
  supabase: SupabaseClient,
  downloaded: DownloadedInventoryFile,
  storeLookup: StoreLookupTables,
): Promise<HomenetFileImportSummary> {
  const base: HomenetFileImportSummary = {
    ...emptyFileSummary(),
    fileName: downloaded.fileName,
    remotePath: downloaded.remotePath,
  };

  let parsed;
  try {
    parsed = parseDealerSendFile(downloaded.content);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to parse DealerSend file";
    return {
      ...base,
      ok: false,
      errors: [{ row: 0, message }],
    };
  }

  base.delimiter = parsed.delimiter;
  base.headerCount = parsed.headers.length;
  base.rowsProcessed = parsed.rows.length;

  const storeMapping = resolveStoreForFile(
    downloaded.fileName,
    parsed.rows,
    storeLookup,
  );

  if (!isResolvedStoreMapping(storeMapping)) {
    return {
      ...base,
      ok: false,
      skipped: true,
      skipReason: storeMapping.reason,
      errors: [{ row: 0, message: storeMapping.reason }],
    };
  }

  const storeName =
    storeMapping.storeName ||
    storeLookup.storeNameById.get(storeMapping.storeId) ||
    "";

  const mappedRows: HomenetVehicleRow[] = [];
  const errors: HomenetImportError[] = [];

  parsed.rows.forEach((raw, index) => {
    try {
      const mapped = mapDealerSendRow(raw, {
        forcedStoreId: storeMapping.storeId,
        importSource: "homenet_dealer_send",
      });

      if (!mapped) {
        errors.push({
          row: index + 2,
          message: "Missing VIN and stock number — row skipped",
        });
        return;
      }

      if (mapped.store_id !== storeMapping.storeId) {
        errors.push({
          row: index + 2,
          import_key: mapped.import_key,
          message: "Row store_id mismatch — row skipped to avoid cross-store mixing",
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

  const skippedRows = parsed.rows.length - mappedRows.length;
  const ok = upserted > 0 || (mappedRows.length > 0 && errors.length === 0);

  return {
    ...base,
    ok,
    storeId: storeMapping.storeId,
    storeName,
    storeMappingSource: storeMapping.source,
    mapped: mappedRows.length,
    skippedRows,
    upserted,
    errors: errors.slice(0, 100),
  };
}

function aggregateFileSummaries(
  files: HomenetFileImportSummary[],
): HomenetImportSummary {
  const filesSkipped = files.filter((file) => file.skipped).length;
  const filesSucceeded = files.filter((file) => file.ok && !file.skipped).length;
  const filesFailed = files.filter(
    (file) => !file.skipped && !file.ok,
  ).length;
  const totalUpserted = files.reduce((sum, file) => sum + file.upserted, 0);

  return {
    ok:
      files.length > 0 &&
      filesFailed === 0 &&
      filesSkipped < files.length &&
      (filesSucceeded > 0 || totalUpserted > 0),
    filesProcessed: files.length,
    filesSkipped,
    filesSucceeded,
    filesFailed,
    totalUpserted,
    files,
  };
}

export async function runHomenetInventoryImport(
  supabase: SupabaseClient,
): Promise<HomenetImportSummary> {
  return runHomenetMultiFileInventoryImport(supabase);
}

/** Multi-dealer SFTP import — processes every .csv/.txt in SFTP_PATH. */
export async function runHomenetMultiFileInventoryImport(
  supabase: SupabaseClient,
): Promise<HomenetImportSummary> {
  const runId = await startFeedImportRun(supabase);

  try {
    const sftpConfig = readSftpConfigFromEnv();
    const downloadedFiles = await downloadAllInventoryFiles(sftpConfig);
    const storeLookup = await fetchStoreLookup(supabase);

    const fileSummaries: HomenetFileImportSummary[] = [];

    for (const downloaded of downloadedFiles) {
      fileSummaries.push(
        await importSingleInventoryFile(supabase, downloaded, storeLookup),
      );
    }

    const summary = aggregateFileSummaries(fileSummaries);
    await completeFeedImportRun(supabase, runId, summary);
    return summary;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "HomeNet import failed";
    await failFeedImportRun(supabase, runId, message);
    throw error;
  }
}
