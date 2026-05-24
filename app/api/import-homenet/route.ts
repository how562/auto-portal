import { NextResponse } from "next/server";
import { getImportSecret, isImportAuthorized } from "@/lib/import/importAuth";
import {
  createFailedImportSummary,
  runHomenetMultiFileInventoryImport,
  type HomenetImportSummary,
} from "@/lib/import/homenetImport";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

/** Bump when the import API response contract changes (helps verify deploys). */
const IMPORT_API_VERSION = 2;

/**
 * HomeNet DealerSend inventory import (server-only).
 *
 * Downloads every .csv and .txt file in SFTP_PATH, maps each file to a store,
 * and upserts vehicles by (store_id, vin). Returns a per-file summary.
 *
 * Local test:
 *   curl "http://localhost:3000/api/import-homenet?secret=YOUR_IMPORT_SECRET"
 *
 * Or header:
 *   curl -H "x-import-secret: YOUR_IMPORT_SECRET" \
 *     "http://localhost:3000/api/import-homenet"
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function buildImportApiResponse(summary: HomenetImportSummary) {
  return {
    importVersion: IMPORT_API_VERSION,
    ok: summary.ok,
    filesProcessed: summary.filesProcessed,
    filesSkipped: summary.filesSkipped,
    filesSucceeded: summary.filesSucceeded,
    filesFailed: summary.filesFailed,
    totalUpserted: summary.totalUpserted,
    files: summary.files,
    ...(summary.error ? { error: summary.error } : {}),
    ...(summary.sftpHost ? { sftpHost: summary.sftpHost } : {}),
    ...(summary.sftpPort ? { sftpPort: summary.sftpPort } : {}),
    ...(summary.sftpUser ? { sftpUser: summary.sftpUser } : {}),
    ...(summary.hasPassword != null ? { hasPassword: summary.hasPassword } : {}),
    ...(summary.passwordLength != null
      ? { passwordLength: summary.passwordLength }
      : {}),
    ...(summary.sftpPath ? { sftpPath: summary.sftpPath } : {}),
  };
}

export async function GET(request: Request) {
  if (!getImportSecret()) {
    return NextResponse.json(
      {
        error:
          "IMPORT_SECRET is not configured. Set it in .env.local or Vercel project settings.",
      },
      { status: 500 },
    );
  }

  if (!isImportAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Supabase service role is not configured (SUPABASE_SERVICE_ROLE_KEY).",
      },
      { status: 500 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const summary = await runHomenetMultiFileInventoryImport(supabase);
    return NextResponse.json(buildImportApiResponse(summary), {
      status: summary.ok ? 200 : 207,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "HomeNet import failed";
    return NextResponse.json(
      buildImportApiResponse(createFailedImportSummary(message)),
      {
        status: 500,
      },
    );
  }
}
