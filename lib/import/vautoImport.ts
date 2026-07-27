import type { SupabaseClient } from "@supabase/supabase-js";
import type { CanonicalVehicleRow } from "@/lib/import/canonicalVehicle";
import {
  parseVautoFeedFile,
  inspectVautoFeedContent,
} from "@/lib/import/providers/vauto/vautoParse";
import { mapVautoRow } from "@/lib/import/providers/vauto/vautoMap";
import {
  upsertCanonicalVehicles,
  type VehicleUpsertError,
} from "@/lib/import/vehicleUpsert";
import { reconcileStaleVehicles } from "@/lib/import/vehicleReconcile";
import { snapshotActiveCountsFromDb } from "@/lib/inventorySnapshots";
import {
  downloadAllInventoryFiles,
  getSftpEnvDebug,
  readVautoSftpConfigFromEnv,
  type DownloadedInventoryFile,
} from "@/lib/import/sftpInventory";
import { loadActiveFeedFileMappings } from "@/lib/feedFileMappings";
import {
  completeFeedImportRun,
  failFeedImportRun,
  startFeedImportRun,
} from "@/lib/feedImportRunLog";
import {
  insertRawFeedArchive,
  logInventoryImportFailure,
} from "@/lib/rawFeedArchive";
import {
  syncInventoryFeedSourceCounts,
  touchInventoryFeedSourceImport,
} from "@/lib/inventoryActiveSource";
import {
  buildStoreLookupTables,
  isResolvedStoreMapping,
  normalizeMappingToken,
  resolveStoreForFile,
  type StoreLookupTables,
  type StoreMappingSource,
} from "@/lib/import/storeMapping";
import type { HomenetImportSummary } from "@/lib/import/homenetImport";

export interface VautoImportError {
  row: number;
  message: string;
  import_key?: string;
}

export interface VautoFileImportSummary {
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
  deactivated: number;
  reconcileSkipped?: boolean;
  reconcileSkipReason?: string;
  archiveId?: string | null;
  errors: VautoImportError[];
}

export interface VautoImportSummary {
  ok: boolean;
  mode: "import";
  filesProcessed: number;
  filesSkipped: number;
  filesSucceeded: number;
  filesFailed: number;
  totalUpserted: number;
  totalDeactivated: number;
  files: VautoFileImportSummary[];
  error?: string;
  sftpHost?: string;
  sftpPort?: number;
  sftpUser?: string;
  hasPassword?: boolean;
  passwordLength?: number;
  sftpPath?: string;
}

function emptyFileSummary(): VautoFileImportSummary {
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
    deactivated: 0,
    errors: [],
  };
}

function mapUpsertErrors(errors: VehicleUpsertError[]): VautoImportError[] {
  return errors.map((e) => ({
    row: e.row,
    message: e.message,
    import_key: e.import_key,
  }));
}

/** Adapt vAuto summary to the shared feed_import_runs logger shape. */
export function toHomenetCompatibleSummary(
  summary: VautoImportSummary,
): HomenetImportSummary {
  return {
    ok: summary.ok,
    filesProcessed: summary.filesProcessed,
    filesSkipped: summary.filesSkipped,
    filesSucceeded: summary.filesSucceeded,
    filesFailed: summary.filesFailed,
    totalUpserted: summary.totalUpserted,
    files: summary.files.map((file) => ({
      ok: file.ok,
      fileName: file.fileName,
      remotePath: file.remotePath,
      skipped: file.skipped,
      skipReason: file.skipReason,
      storeId: file.storeId,
      storeName: file.storeName,
      storeMappingSource: file.storeMappingSource,
      delimiter: file.delimiter,
      headerCount: file.headerCount,
      rowsProcessed: file.rowsProcessed,
      mapped: file.mapped,
      skippedRows: file.skippedRows,
      upserted: file.upserted,
      errors: file.errors,
    })),
    error: summary.error,
    sftpHost: summary.sftpHost,
    sftpPort: summary.sftpPort,
    sftpUser: summary.sftpUser,
    hasPassword: summary.hasPassword,
    passwordLength: summary.passwordLength,
    sftpPath: summary.sftpPath,
  };
}

export function createFailedVautoImportSummary(
  message: string,
): VautoImportSummary {
  return {
    ok: false,
    mode: "import",
    filesProcessed: 0,
    filesSkipped: 0,
    filesSucceeded: 0,
    filesFailed: 0,
    totalUpserted: 0,
    totalDeactivated: 0,
    files: [],
    error: message,
    ...getSftpEnvDebug("VAUTO_"),
  };
}

async function fetchStoreLookup(
  supabase: SupabaseClient,
): Promise<StoreLookupTables> {
  const [{ data, error }, dbFileMap] = await Promise.all([
    supabase.from("stores").select("id, name"),
    loadActiveFeedFileMappings(supabase),
  ]);

  if (error || !data) {
    throw new Error(
      `Failed to load stores for import mapping: ${error?.message ?? "unknown"}`,
    );
  }

  return buildStoreLookupTables(
    (data ?? []) as Array<{ id: string; name: string | null }>,
    dbFileMap,
  );
}

function buildDealerIdLookup(lookup: StoreLookupTables): Map<string, string> {
  const map = new Map<string, string>();
  for (const [token, storeId] of Array.from(
    lookup.storeIdByNormalizedName.entries(),
  )) {
    map.set(token, storeId);
  }
  for (const [token, storeId] of Array.from(lookup.fileMap.entries())) {
    map.set(token, storeId);
  }
  for (const [token, storeId] of Array.from(lookup.dbFileMap.entries())) {
    map.set(token, storeId);
  }
  for (const [storeId, storeName] of Array.from(
    lookup.storeNameById.entries(),
  )) {
    const token = normalizeMappingToken(storeName);
    if (token && !map.has(token)) map.set(token, storeId);
  }
  return map;
}

async function importSingleVautoFile(
  supabase: SupabaseClient,
  downloaded: DownloadedInventoryFile,
  storeLookup: StoreLookupTables,
  runId: string | null,
): Promise<VautoFileImportSummary> {
  const base: VautoFileImportSummary = {
    ...emptyFileSummary(),
    fileName: downloaded.fileName,
    remotePath: downloaded.remotePath,
  };

  const byteSize = Buffer.byteLength(downloaded.content, "utf8");
  const inspection = inspectVautoFeedContent(downloaded.content);

  let parsed;
  try {
    parsed = parseVautoFeedFile(downloaded.content);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to parse vAuto file";
    const archiveId = await insertRawFeedArchive(supabase, {
      feedImportRunId: runId,
      inventoryProvider: "vauto",
      fileName: downloaded.fileName,
      remotePath: downloaded.remotePath,
      byteSize,
      storageKind: "sftp_retained",
      storagePath: downloaded.remotePath,
      parseStatus: "failed",
      errorMessage: message,
      metadata: {
        headerPreview: inspection.headerPreview,
        columnHeaders: inspection.columnHeaders,
        rowCountEstimate: inspection.rowCountEstimate,
        modifiedAt: downloaded.modifiedAt,
      },
    });
    await logInventoryImportFailure(supabase, {
      feedImportRunId: runId,
      rawFeedArchiveId: archiveId,
      inventoryProvider: "vauto",
      failureScope: "file",
      fileName: downloaded.fileName,
      errorCode: "parse_error",
      errorMessage: message,
    });
    return {
      ...base,
      ok: false,
      archiveId,
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
    const archiveId = await insertRawFeedArchive(supabase, {
      feedImportRunId: runId,
      inventoryProvider: "vauto",
      fileName: downloaded.fileName,
      remotePath: downloaded.remotePath,
      byteSize,
      storageKind: "sftp_retained",
      storagePath: downloaded.remotePath,
      parseStatus: "skipped",
      errorMessage: storeMapping.reason,
      metadata: {
        headerPreview: inspection.headerPreview,
        columnHeaders: parsed.headers,
        rowCountEstimate: parsed.rows.length,
        modifiedAt: downloaded.modifiedAt,
      },
    });
    await logInventoryImportFailure(supabase, {
      feedImportRunId: runId,
      rawFeedArchiveId: archiveId,
      inventoryProvider: "vauto",
      failureScope: "file",
      fileName: downloaded.fileName,
      errorCode: "store_mapping",
      errorMessage: storeMapping.reason,
    });
    return {
      ...base,
      ok: false,
      skipped: true,
      skipReason: storeMapping.reason,
      archiveId,
      errors: [{ row: 0, message: storeMapping.reason }],
    };
  }

  const storeName =
    storeMapping.storeName ||
    storeLookup.storeNameById.get(storeMapping.storeId) ||
    "";

  const archiveId = await insertRawFeedArchive(supabase, {
    feedImportRunId: runId,
    storeId: storeMapping.storeId,
    inventoryProvider: "vauto",
    fileName: downloaded.fileName,
    remotePath: downloaded.remotePath,
    byteSize,
    storageKind: "sftp_retained",
    storagePath: downloaded.remotePath,
    parseStatus: "parsed",
    metadata: {
      headerPreview: inspection.headerPreview,
      columnHeaders: parsed.headers,
      rowCountEstimate: parsed.rows.length,
      modifiedAt: downloaded.modifiedAt,
      storeMappingSource: storeMapping.source,
    },
  });

  const dealerIdLookup = buildDealerIdLookup(storeLookup);
  const mappedRows: CanonicalVehicleRow[] = [];
  const errors: VautoImportError[] = [];

  parsed.rows.forEach((raw, index) => {
    try {
      const mapped = mapVautoRow(raw, {
        forcedStoreId: storeMapping.storeId,
        importSource: "vauto",
        storeIdByDealerName: storeLookup.storeIdByDealerName,
        storeIdByDealerId: dealerIdLookup,
      });

      if (!mapped) {
        errors.push({
          row: index + 2,
          message: "Row skipped — missing VIN/stock or make/model",
        });
        return;
      }

      if (mapped.store_id !== storeMapping.storeId) {
        errors.push({
          row: index + 2,
          import_key: mapped.import_key,
          message:
            "Row store_id mismatch — row skipped to avoid cross-store mixing",
        });
        return;
      }

      mappedRows.push(mapped);
    } catch (error: unknown) {
      errors.push({
        row: index + 2,
        message: error instanceof Error ? error.message : "Failed to map row",
      });
    }
  });

  const upsertResult = await upsertCanonicalVehicles(
    supabase,
    mappedRows,
    "vauto",
  );
  const upserted = upsertResult.upserted;
  errors.push(...mapUpsertErrors(upsertResult.errors));

  const seenVins = mappedRows
    .map((row) => row.vin)
    .filter((vin): vin is string => Boolean(vin?.trim()));

  let deactivated = 0;
  let reconcileSkipped = false;
  let reconcileSkipReason: string | undefined;

  if (upserted > 0 || mappedRows.length > 0) {
    const reconcile = await reconcileStaleVehicles(
      supabase,
      storeMapping.storeId,
      "vauto",
      seenVins,
    );
    deactivated = reconcile.deactivated;
    reconcileSkipped = reconcile.skipped;
    reconcileSkipReason = reconcile.skipReason;
  } else {
    reconcileSkipped = true;
    reconcileSkipReason =
      "Reconcile skipped — no mapped rows (refusing to deactivate inventory)";
  }

  const skippedRows = parsed.rows.length - mappedRows.length;
  const fatalUpsertErrors = upsertResult.errors.length;
  const ok =
    upserted > 0 || (mappedRows.length > 0 && fatalUpsertErrors === 0);

  // Log real failures only — routine VIN/make skips stay in the per-file error cap.
  const failuresToPersist = errors.filter(
    (err) =>
      err.message.includes("failed") ||
      err.message.includes("mismatch") ||
      err.message.includes("Missing store"),
  );
  for (const err of failuresToPersist.slice(0, 25)) {
    await logInventoryImportFailure(supabase, {
      feedImportRunId: runId,
      rawFeedArchiveId: archiveId,
      inventoryProvider: "vauto",
      storeId: storeMapping.storeId,
      failureScope: "row",
      fileName: downloaded.fileName,
      rowNumber: err.row,
      importKey: err.import_key ?? null,
      errorCode: "row_error",
      errorMessage: err.message,
    });
  }

  return {
    ...base,
    ok,
    storeId: storeMapping.storeId,
    storeName,
    storeMappingSource: storeMapping.source,
    mapped: mappedRows.length,
    skippedRows,
    upserted,
    deactivated,
    reconcileSkipped,
    reconcileSkipReason,
    archiveId,
    errors: errors.slice(0, 100),
  };
}

function aggregateFileSummaries(
  files: VautoFileImportSummary[],
): VautoImportSummary {
  const filesSkipped = files.filter((file) => file.skipped).length;
  const filesSucceeded = files.filter((file) => file.ok && !file.skipped).length;
  const filesFailed = files.filter((file) => !file.skipped && !file.ok).length;
  const totalUpserted = files.reduce((sum, file) => sum + file.upserted, 0);
  const totalDeactivated = files.reduce(
    (sum, file) => sum + file.deactivated,
    0,
  );

  return {
    ok:
      files.length > 0 &&
      filesFailed === 0 &&
      filesSkipped < files.length &&
      (filesSucceeded > 0 || totalUpserted > 0),
    mode: "import",
    filesProcessed: files.length,
    filesSkipped,
    filesSucceeded,
    filesFailed,
    totalUpserted,
    totalDeactivated,
    files,
  };
}

/**
 * Full vAuto import: SFTP download → parse → map → upsert (inventory_provider=vauto)
 * → safe stale reconcile. Does not change the active public inventory source.
 */
export async function runVautoInventoryImport(
  supabase: SupabaseClient,
): Promise<VautoImportSummary> {
  const runId = await startFeedImportRun(supabase, {
    inventoryProvider: "vauto",
    runKind: "import",
  });

  try {
    const config = readVautoSftpConfigFromEnv();
    const downloadedFiles = await downloadAllInventoryFiles(config);
    const storeLookup = await fetchStoreLookup(supabase);
    const fileSummaries: VautoFileImportSummary[] = [];

    for (const downloaded of downloadedFiles) {
      fileSummaries.push(
        await importSingleVautoFile(
          supabase,
          downloaded,
          storeLookup,
          runId,
        ),
      );
    }

    const summary = aggregateFileSummaries(fileSummaries);
    const withDebug: VautoImportSummary = {
      ...summary,
      ...getSftpEnvDebug("VAUTO_"),
    };

    await completeFeedImportRun(
      supabase,
      runId,
      toHomenetCompatibleSummary(withDebug),
    );

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
        .eq("inventory_provider", "vauto");
      await touchInventoryFeedSourceImport(storeId, "vauto", count ?? 0);
    }
    await syncInventoryFeedSourceCounts();

    await snapshotActiveCountsFromDb(supabase, {
      inventoryProvider: "vauto",
      feedImportRunId: runId,
      storeIds: Array.from(storeIds),
      runKind: "import",
    });

    await supabase
      .from("inventory_feed_sources")
      .update({
        last_intake_at: new Date().toISOString(),
        last_error_message: withDebug.ok
          ? null
          : withDebug.error ?? "Partial vAuto import",
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "vauto");

    return withDebug;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "vAuto import failed";
    await failFeedImportRun(supabase, runId, message);
    await logInventoryImportFailure(supabase, {
      feedImportRunId: runId,
      inventoryProvider: "vauto",
      failureScope: "run",
      errorCode: "import_run_error",
      errorMessage: message,
    });
    return createFailedVautoImportSummary(message);
  }
}
