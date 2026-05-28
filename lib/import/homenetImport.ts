import type { SupabaseClient } from "@supabase/supabase-js";
import { parseDealerSendFile } from "./dealerSendParse";
import type { CanonicalVehicleRow } from "@/lib/import/canonicalVehicle";
import { mapDealerSendRowToCanonical } from "@/lib/import/providers/homenet/mapToCanonical";
import {
  upsertCanonicalVehicles,
  type VehicleUpsertError,
} from "@/lib/import/vehicleUpsert";
import { snapshotActiveCountsFromDb } from "@/lib/inventorySnapshots";
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
  syncInventoryFeedSourceCounts,
  touchInventoryFeedSourceImport,
} from "@/lib/inventoryActiveSource";
import {
  buildStoreLookupTables,
  isResolvedStoreMapping,
  resolveStoreForFile,
  type StoreLookupTables,
  type StoreMappingSource,
} from "./storeMapping";

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

function mapUpsertErrors(errors: VehicleUpsertError[]): HomenetImportError[] {
  return errors.map((e) => ({
    row: e.row,
    message: e.message,
    import_key: e.import_key,
  }));
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

  const mappedRows: CanonicalVehicleRow[] = [];
  const errors: HomenetImportError[] = [];

  parsed.rows.forEach((raw, index) => {
    try {
      const mapped = mapDealerSendRowToCanonical(raw, {
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

  const upsertResult = await upsertCanonicalVehicles(
    supabase,
    mappedRows,
    "homenet",
  );
  const upserted = upsertResult.upserted;
  errors.push(...mapUpsertErrors(upsertResult.errors));

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
  const runId = await startFeedImportRun(supabase, {
    inventoryProvider: "homenet",
    runKind: "import",
  });

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

    const storeIds = new Set(
      fileSummaries
        .map((f) => f.storeId)
        .filter((id): id is string => Boolean(id)),
    );
    for (const storeId of Array.from(storeIds)) {
      const { count } = await supabase
        .from("vehicles")
        .select("id", { count: "exact", head: true })
        .eq("store_id", storeId)
        .eq("status", "active")
        .eq("inventory_provider", "homenet");
      await touchInventoryFeedSourceImport(
        storeId,
        "homenet",
        count ?? 0,
      );
    }
    await syncInventoryFeedSourceCounts();

    await snapshotActiveCountsFromDb(supabase, {
      inventoryProvider: "homenet",
      feedImportRunId: runId,
      storeIds: Array.from(storeIds),
      runKind: "import",
    });

    return summary;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "HomeNet import failed";
    await failFeedImportRun(supabase, runId, message);
    throw error;
  }
}
