import type { SupabaseClient } from "@supabase/supabase-js";
import {
  completeFeedImportRun,
  failFeedImportRun,
  startFeedImportRun,
} from "@/lib/feedImportRunLog";
import { loadActiveFeedFileMappings } from "@/lib/feedFileMappings";
import type { HomenetImportSummary } from "@/lib/import/homenetImport";
import {
  insertRawFeedArchive,
  logInventoryImportFailure,
} from "@/lib/rawFeedArchive";
import {
  mapVautoRowsDetailed,
  parseVautoFeedFile,
  isVautoInventoryFileName,
} from "@/lib/import/providers/vauto";
import { normalizeDealerToken } from "@/lib/import/providers/vauto/vautoFieldUtils";
import {
  softDeactivateMissingProviderVins,
  upsertCanonicalVehicles,
  type VehicleUpsertError,
} from "@/lib/import/vehicleUpsert";
import {
  downloadAllInventoryFiles,
  getSftpEnvDebug,
  readVautoSftpConfigFromEnv,
  type DownloadedInventoryFile,
} from "@/lib/import/sftpInventory";
import {
  buildStoreLookupTables,
  isResolvedStoreMapping,
  resolveStoreForFile,
  type StoreLookupTables,
  type StoreMappingSource,
} from "@/lib/import/storeMapping";
import {
  syncInventoryFeedSourceCounts,
  touchInventoryFeedSourceImport,
} from "@/lib/inventoryActiveSource";
import { snapshotActiveCountsFromDb } from "@/lib/inventorySnapshots";

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
  errors: VautoImportError[];
}

export interface VautoImportSummary {
  ok: boolean;
  mode: "import" | "inline";
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
  runId?: string | null;
}

export interface InlineVautoImportInput {
  csvContent: string;
  fileName?: string;
  /** Optional forced store UUID for inline tests. */
  storeId?: string | null;
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

function toRunSummary(summary: VautoImportSummary): HomenetImportSummary {
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

function aggregateFileSummaries(
  files: VautoFileImportSummary[],
  mode: VautoImportSummary["mode"],
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
    mode,
    filesProcessed: files.length,
    filesSkipped,
    filesSucceeded,
    filesFailed,
    totalUpserted,
    totalDeactivated,
    files,
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
    { includeVautoEnvMap: true },
  );
}

function buildDealerIdentifierMap(
  lookup: StoreLookupTables,
): Map<string, string> {
  const map = new Map<string, string>();
  for (const [token, storeId] of Array.from(lookup.fileMap.entries())) {
    map.set(token, storeId);
  }
  for (const [token, storeId] of Array.from(lookup.dbFileMap.entries())) {
    map.set(token, storeId);
  }
  for (const [name, storeId] of Array.from(
    lookup.storeIdByNormalizedName.entries(),
  )) {
    map.set(name, storeId);
  }
  return map;
}

async function importSingleVautoFile(
  supabase: SupabaseClient,
  downloaded: DownloadedInventoryFile,
  storeLookup: StoreLookupTables,
  options: {
    runId: string | null;
    forcedStoreId?: string | null;
    reconcile?: boolean;
  },
): Promise<VautoFileImportSummary> {
  const base: VautoFileImportSummary = {
    ...emptyFileSummary(),
    fileName: downloaded.fileName,
    remotePath: downloaded.remotePath,
  };

  if (!isVautoInventoryFileName(downloaded.fileName) && downloaded.remotePath !== "inline") {
    return {
      ...base,
      ok: false,
      skipped: true,
      skipReason: "Unsupported file type — only .csv / .txt are imported",
      errors: [{ row: 0, message: "Unsupported file type" }],
    };
  }

  let parsed;
  try {
    parsed = parseVautoFeedFile(downloaded.content);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to parse vAuto file";
    await logInventoryImportFailure(supabase, {
      feedImportRunId: options.runId,
      inventoryProvider: "vauto",
      failureScope: "file",
      fileName: downloaded.fileName,
      errorCode: "parse_error",
      errorMessage: message,
    });
    return {
      ...base,
      ok: false,
      errors: [{ row: 0, message }],
    };
  }

  base.delimiter = parsed.delimiter;
  base.headerCount = parsed.headers.length;
  base.rowsProcessed = parsed.rows.length;

  let storeId = options.forcedStoreId?.trim() || null;
  let storeName = "";
  let storeMappingSource: StoreMappingSource | undefined;

  if (storeId) {
    storeName = storeLookup.storeNameById.get(storeId) ?? "";
    storeMappingSource = "feed_file_mappings";
  } else {
    const storeMapping = resolveStoreForFile(
      downloaded.fileName,
      parsed.rows,
      storeLookup,
    );
    if (!isResolvedStoreMapping(storeMapping)) {
      await logInventoryImportFailure(supabase, {
        feedImportRunId: options.runId,
        inventoryProvider: "vauto",
        failureScope: "file",
        fileName: downloaded.fileName,
        errorCode: "store_unresolved",
        errorMessage: storeMapping.reason,
      });
      return {
        ...base,
        ok: false,
        skipped: true,
        skipReason: storeMapping.reason,
        errors: [{ row: 0, message: storeMapping.reason }],
      };
    }
    storeId = storeMapping.storeId;
    storeName =
      storeMapping.storeName ||
      storeLookup.storeNameById.get(storeMapping.storeId) ||
      "";
    storeMappingSource = storeMapping.source;
  }

  const byteSize = Buffer.byteLength(downloaded.content, "utf8");
  await insertRawFeedArchive(supabase, {
    feedImportRunId: options.runId,
    storeId,
    inventoryProvider: "vauto",
    fileName: downloaded.fileName,
    remotePath: downloaded.remotePath,
    byteSize,
    storageKind:
      downloaded.remotePath === "inline" ? "inline_pending" : "sftp_retained",
    storagePath: downloaded.remotePath,
    parseStatus: "parsed",
    metadata: {
      headerCount: parsed.headers.length,
      rowCount: parsed.rows.length,
      storeMappingSource,
    },
  });

  const dealerIdMap = buildDealerIdentifierMap(storeLookup);
  const mapResult = mapVautoRowsDetailed(parsed.rows, {
    forcedStoreId: storeId,
    importSource: "vauto",
    storeIdByDealerName: storeLookup.storeIdByDealerName,
    storeIdByDealerIdentifier: dealerIdMap,
  });

  const errors: VautoImportError[] = [];
  mapResult.skipReasons.forEach((reason, index) => {
    if (!reason) return;
    const message =
      reason === "missing_key"
        ? "Missing VIN and stock number — row skipped"
        : "Missing make or model — row skipped";
    errors.push({ row: index + 2, message });
    void logInventoryImportFailure(supabase, {
      feedImportRunId: options.runId,
      inventoryProvider: "vauto",
      storeId,
      failureScope: "row",
      fileName: downloaded.fileName,
      rowNumber: index + 2,
      errorCode: reason,
      errorMessage: message,
    });
  });

  const mappedRows = mapResult.mapped.filter((row) => {
    if (row.store_id !== storeId) {
      errors.push({
        row: 0,
        import_key: row.import_key,
        message: "Row store_id mismatch — row skipped to avoid cross-store mixing",
      });
      return false;
    }
    return true;
  });

  const upsertResult = await upsertCanonicalVehicles(
    supabase,
    mappedRows,
    "vauto",
  );
  errors.push(...mapUpsertErrors(upsertResult.errors));

  for (const err of upsertResult.errors) {
    await logInventoryImportFailure(supabase, {
      feedImportRunId: options.runId,
      inventoryProvider: "vauto",
      storeId,
      failureScope: "row",
      fileName: downloaded.fileName,
      importKey: err.import_key,
      errorCode: "upsert_failed",
      errorMessage: err.message,
    });
  }

  let deactivated = 0;
  if (options.reconcile !== false) {
    const seenVins = mappedRows
      .map((row) => row.vin)
      .filter((vin): vin is string => Boolean(vin?.trim()));
    try {
      deactivated = await softDeactivateMissingProviderVins(
        supabase,
        storeId,
        "vauto",
        seenVins,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Reconcile failed";
      errors.push({ row: 0, message });
      await logInventoryImportFailure(supabase, {
        feedImportRunId: options.runId,
        inventoryProvider: "vauto",
        storeId,
        failureScope: "file",
        fileName: downloaded.fileName,
        errorCode: "reconcile_failed",
        errorMessage: message,
      });
    }
  }

  const skippedRows = parsed.rows.length - mappedRows.length;
  const ok =
    upsertResult.upserted > 0 ||
    (mappedRows.length > 0 && upsertResult.errors.length === 0);

  return {
    ...base,
    ok,
    storeId,
    storeName,
    storeMappingSource,
    mapped: mappedRows.length,
    skippedRows,
    upserted: upsertResult.upserted,
    deactivated,
    errors: errors.slice(0, 100),
  };
}

async function finalizeStoreFeedSources(
  supabase: SupabaseClient,
  storeIds: Set<string>,
  runId: string | null,
): Promise<void> {
  for (const storeId of Array.from(storeIds)) {
    const { count } = await supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("status", "active")
      .eq("inventory_provider", "vauto");
    await touchInventoryFeedSourceImport(storeId, "vauto", count ?? 0);

    // Best-effort status fields when columns exist (migration may lag).
    await supabase
      .from("inventory_feed_sources")
      .update({
        last_intake_at: new Date().toISOString(),
        last_error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("store_id", storeId)
      .eq("provider", "vauto");
  }
  await syncInventoryFeedSourceCounts();
  await snapshotActiveCountsFromDb(supabase, {
    inventoryProvider: "vauto",
    feedImportRunId: runId,
    storeIds: Array.from(storeIds),
    runKind: "import",
  });
}

/**
 * Full vAuto inventory import from DigitalOcean SFTP.
 * Does not delete remote files. Does not change active inventory providers.
 */
export async function runVautoInventoryImport(
  supabase: SupabaseClient,
): Promise<VautoImportSummary> {
  const runId = await startFeedImportRun(supabase, {
    inventoryProvider: "vauto",
    runKind: "import",
  });

  try {
    const sftpConfig = readVautoSftpConfigFromEnv();
    const downloadedFiles = await downloadAllInventoryFiles(sftpConfig);
    const storeLookup = await fetchStoreLookup(supabase);
    const fileSummaries: VautoFileImportSummary[] = [];

    for (const downloaded of downloadedFiles) {
      if (!isVautoInventoryFileName(downloaded.fileName)) {
        fileSummaries.push({
          ...emptyFileSummary(),
          fileName: downloaded.fileName,
          remotePath: downloaded.remotePath,
          skipped: true,
          skipReason: "Unsupported file type — only .csv / .txt",
          errors: [{ row: 0, message: "Unsupported file type" }],
        });
        continue;
      }
      fileSummaries.push(
        await importSingleVautoFile(supabase, downloaded, storeLookup, {
          runId,
          reconcile: true,
        }),
      );
    }

    const summary = aggregateFileSummaries(fileSummaries, "import");
    summary.runId = runId;
    Object.assign(summary, getSftpEnvDebug("VAUTO_"));

    await completeFeedImportRun(supabase, runId, toRunSummary(summary));

    const storeIds = new Set(
      fileSummaries
        .map((f) => f.storeId)
        .filter((id): id is string => Boolean(id)),
    );
    if (storeIds.size > 0) {
      await finalizeStoreFeedSources(supabase, storeIds, runId);
    }

    return summary;
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
      runId,
      ...getSftpEnvDebug("VAUTO_"),
    };
  }
}

/**
 * Inline CSV/TXT test import (no SFTP). Useful for parser validation before
 * production SFTP cutover.
 */
export async function runVautoInlineImport(
  supabase: SupabaseClient,
  input: InlineVautoImportInput,
): Promise<VautoImportSummary> {
  const csvContent = input.csvContent?.trim() ?? "";
  if (!csvContent) {
    return createFailedVautoImportSummary("csvContent is required");
  }

  const runId = await startFeedImportRun(supabase, {
    inventoryProvider: "vauto",
    runKind: "import",
    storeId: input.storeId ?? null,
  });

  try {
    const storeLookup = await fetchStoreLookup(supabase);
    const fileName = input.fileName?.trim() || "inline-upload.csv";
    const downloaded: DownloadedInventoryFile = {
      fileName,
      remotePath: "inline",
      modifiedAt: null,
      content: csvContent,
    };

    const fileSummary = await importSingleVautoFile(
      supabase,
      downloaded,
      storeLookup,
      {
        runId,
        forcedStoreId: input.storeId,
        reconcile: true,
      },
    );

    const summary = aggregateFileSummaries([fileSummary], "inline");
    summary.runId = runId;
    await completeFeedImportRun(supabase, runId, toRunSummary(summary));

    if (fileSummary.storeId) {
      await finalizeStoreFeedSources(
        supabase,
        new Set([fileSummary.storeId]),
        runId,
      );
    }

    return summary;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "vAuto inline import failed";
    await failFeedImportRun(supabase, runId, message);
    return {
      ok: false,
      mode: "inline",
      filesProcessed: 0,
      filesSkipped: 0,
      filesSucceeded: 0,
      filesFailed: 0,
      totalUpserted: 0,
      totalDeactivated: 0,
      files: [],
      error: message,
      runId,
    };
  }
}

export function createFailedVautoImportSummary(
  message: string,
  includeSftpDebug = false,
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
    ...(includeSftpDebug ? getSftpEnvDebug("VAUTO_") : {}),
  };
}

/** @deprecated Prefer normalizeDealerToken from vautoFieldUtils. */
export { normalizeDealerToken };
