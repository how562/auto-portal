import { NextResponse } from "next/server";
import {
  isImportAuthConfigured,
  isImportAuthorized,
} from "@/lib/import/importAuth";
import {
  createFailedVautoImportSummary,
  runVautoInlineImport,
  runVautoInventoryImport,
  type VautoImportSummary,
} from "@/lib/import/vautoImport";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

const IMPORT_API_VERSION = 2;

/**
 * Portal-owned vAuto inventory import (server-only).
 *
 * Runtime choice: Next.js Node is the primary importer because multi-store
 * `feed_file_mappings`, shared `vehicleUpsert`, and `ssh2-sftp-client` already
 * live in this App Router codebase. Companion Edge Function:
 * `supabase/functions/inventory-import` (cron-compatible thin entry).
 *
 * GET  — DigitalOcean SFTP production import (`VAUTO_SFTP_*`)
 * POST — inline CSV/TXT: `{ csvContent, fileName?, storeId? }`
 *
 * Auth: `IMPORT_SECRET` or `IMPORT_CRON_SECRET` / `CRON_SECRET`
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function buildResponse(summary: VautoImportSummary) {
  return {
    importVersion: IMPORT_API_VERSION,
    mode: summary.mode,
    ok: summary.ok,
    runId: summary.runId ?? null,
    filesProcessed: summary.filesProcessed,
    filesSucceeded: summary.filesSucceeded,
    filesFailed: summary.filesFailed,
    filesSkipped: summary.filesSkipped,
    totalUpserted: summary.totalUpserted,
    totalDeactivated: summary.totalDeactivated,
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

function requireAuth(request: Request): NextResponse | null {
  if (!isImportAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "IMPORT_SECRET (or IMPORT_CRON_SECRET) is not configured. Set it in .env.local or project settings.",
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
  return null;
}

export async function GET(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdmin();
    const summary = await runVautoInventoryImport(supabase);
    return NextResponse.json(buildResponse(summary), {
      status: summary.ok ? 200 : 207,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "vAuto import failed";
    return NextResponse.json(
      buildResponse(createFailedVautoImportSummary(message, true)),
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const authError = requireAuth(request);
  if (authError) return authError;

  let body: {
    csvContent?: string;
    fileName?: string;
    storeId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.csvContent?.trim()) {
    return NextResponse.json(
      { error: "csvContent is required for inline import" },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const summary = await runVautoInlineImport(supabase, {
      csvContent: body.csvContent,
      fileName: body.fileName,
      storeId: body.storeId,
    });
    return NextResponse.json(buildResponse(summary), {
      status: summary.ok ? 200 : 207,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "vAuto inline import failed";
    return NextResponse.json(
      buildResponse(createFailedVautoImportSummary(message)),
      { status: 500 },
    );
  }
}
