import type { SupabaseClient } from "@supabase/supabase-js";
import {
  completeFeedImportRun,
  failFeedImportRun,
  startFeedImportRun,
} from "@/lib/feedImportRunLog";
import {
  insertRawFeedArchive,
  logInventoryImportFailure,
} from "@/lib/rawFeedArchive";
import { inspectVautoFeedContent } from "@/lib/import/providers/vauto";
import {
  downloadAllInventoryFiles,
  getSftpEnvDebug,
  readVautoSftpConfigFromEnv,
} from "@/lib/import/sftpInventory";
import { recordInventorySnapshotsForStores } from "@/lib/inventorySnapshots";
import type { HomenetImportSummary } from "@/lib/import/homenetImport";
import { touchInventoryFeedSourceImport } from "@/lib/inventoryActiveSource";

export interface VautoIntakeFileSummary {
  ok: boolean;
  fileName: string;
  remotePath: string;
  byteSize: number;
  detectedFormat: string;
  headerPreview: string[];
  rowCountEstimate: number | null;
  archiveId: string | null;
  error?: string;
}

export interface VautoIntakeSummary {
  ok: boolean;
  mode: "intake";
  filesProcessed: number;
  filesSucceeded: number;
  filesFailed: number;
  filesSkipped: number;
  totalUpserted: number;
  files: VautoIntakeFileSummary[];
  error?: string;
  sftpHost?: string;
  sftpPort?: number;
  sftpUser?: string;
  hasPassword?: boolean;
  passwordLength?: number;
  sftpPath?: string;
}

function toRunSummary(summary: VautoIntakeSummary): HomenetImportSummary {
  return {
    ok: summary.ok,
    filesProcessed: summary.filesProcessed,
    filesSkipped: summary.filesSkipped,
    filesSucceeded: summary.filesSucceeded,
    filesFailed: summary.filesFailed,
    totalUpserted: 0,
    files: summary.files.map((file) => ({
      ok: file.ok,
      fileName: file.fileName,
      remotePath: file.remotePath,
      skipped: false,
      delimiter: "",
      headerCount: file.headerPreview.length,
      rowsProcessed: file.rowCountEstimate ?? 0,
      mapped: 0,
      skippedRows: 0,
      upserted: 0,
      errors: file.error ? [{ row: 0, message: file.error }] : [],
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

/**
 * Phase 1 vAuto pipeline: SFTP discovery + raw archive metadata only.
 * Does NOT upsert vehicles — parser mapping comes after vAuto delivers exports.
 */
export async function runVautoInventoryIntake(
  supabase: SupabaseClient,
): Promise<VautoIntakeSummary> {
  const runId = await startFeedImportRun(supabase, {
    inventoryProvider: "vauto",
    runKind: "intake",
  });

  try {
    const config = readVautoSftpConfigFromEnv();
    const downloaded = await downloadAllInventoryFiles(config);
    const fileSummaries: VautoIntakeFileSummary[] = [];

    for (const file of downloaded) {
      try {
        const inspection = inspectVautoFeedContent(file.content);
        const byteSize = Buffer.byteLength(file.content, "utf8");
        const archiveId = await insertRawFeedArchive(supabase, {
          feedImportRunId: runId,
          inventoryProvider: "vauto",
          fileName: file.fileName,
          remotePath: file.remotePath,
          byteSize,
          storageKind: "sftp_retained",
          storagePath: file.remotePath,
          parseStatus: "inspected",
          metadata: {
            headerPreview: inspection.headerPreview,
            columnHeaders: inspection.columnHeaders,
            rowCountEstimate: inspection.rowCountEstimate,
            modifiedAt: file.modifiedAt,
          },
        });

        fileSummaries.push({
          ok: true,
          fileName: file.fileName,
          remotePath: file.remotePath,
          byteSize,
          detectedFormat: inspection.detectedFormat,
          headerPreview: inspection.headerPreview,
          rowCountEstimate: inspection.rowCountEstimate,
          archiveId,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "vAuto file intake failed";
        await logInventoryImportFailure(supabase, {
          feedImportRunId: runId,
          inventoryProvider: "vauto",
          failureScope: "file",
          fileName: file.fileName,
          errorCode: "intake_file_error",
          errorMessage: message,
        });
        fileSummaries.push({
          ok: false,
          fileName: file.fileName,
          remotePath: file.remotePath,
          byteSize: 0,
          detectedFormat: "unknown",
          headerPreview: [],
          rowCountEstimate: null,
          archiveId: null,
          error: message,
        });
      }
    }

    const filesFailed = fileSummaries.filter((f) => !f.ok).length;
    const filesSucceeded = fileSummaries.filter((f) => f.ok).length;
    const summary: VautoIntakeSummary = {
      ok: filesSucceeded > 0 && filesFailed === 0,
      mode: "intake",
      filesProcessed: fileSummaries.length,
      filesSucceeded,
      filesFailed,
      filesSkipped: 0,
      totalUpserted: 0,
      files: fileSummaries,
      ...getSftpEnvDebug("VAUTO_"),
    };

    await completeFeedImportRun(supabase, runId, toRunSummary(summary));

    await supabase
      .from("inventory_feed_sources")
      .update({
        last_intake_at: new Date().toISOString(),
        last_error_message: summary.ok ? null : summary.error ?? "Partial intake",
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "vauto");

    const { data: vautoSources } = await supabase
      .from("inventory_feed_sources")
      .select("store_id")
      .eq("provider", "vauto");

    const totalRows = fileSummaries.reduce(
      (sum, f) => sum + (f.rowCountEstimate ?? 0),
      0,
    );

    if (filesSucceeded > 0 && vautoSources?.length) {
      const perStoreEstimate = Math.floor(
        totalRows / Math.max(1, vautoSources.length),
      );
      for (const src of vautoSources) {
        const storeId = src.store_id as string;
        await touchInventoryFeedSourceImport(storeId, "vauto", perStoreEstimate);
      }
      await recordInventorySnapshotsForStores(
        supabase,
        vautoSources.map((src) => ({
          storeId: src.store_id as string,
          inventoryProvider: "vauto" as const,
          activeVehicleCount: perStoreEstimate,
          feedImportRunId: runId,
        })),
      );
    }

    return summary;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "vAuto intake failed";
    const debug = getSftpEnvDebug("VAUTO_");
    await failFeedImportRun(supabase, runId, message);
    await logInventoryImportFailure(supabase, {
      feedImportRunId: runId,
      inventoryProvider: "vauto",
      failureScope: "run",
      errorCode: "intake_run_error",
      errorMessage: message,
    });
    return {
      ok: false,
      mode: "intake",
      filesProcessed: 0,
      filesSucceeded: 0,
      filesFailed: 0,
      filesSkipped: 0,
      totalUpserted: 0,
      files: [],
      error: message,
      ...debug,
    };
  }
}

export function createFailedVautoIntakeSummary(
  message: string,
): VautoIntakeSummary {
  return {
    ok: false,
    mode: "intake",
    filesProcessed: 0,
    filesSucceeded: 0,
    filesFailed: 0,
    filesSkipped: 0,
    totalUpserted: 0,
    files: [],
    error: message,
    ...getSftpEnvDebug("VAUTO_"),
  };
}
