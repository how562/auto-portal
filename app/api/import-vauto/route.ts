import { NextResponse } from "next/server";
import { getImportSecret, isImportAuthorized } from "@/lib/import/importAuth";
import {
  createFailedVautoIntakeSummary,
  runVautoInventoryIntake,
  type VautoIntakeSummary,
} from "@/lib/import/vautoIntake";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

const IMPORT_API_VERSION = 1;

/**
 * vAuto SFTP intake (server-only) — phase 1: discover + archive metadata.
 *
 * Does not parse or upsert vehicles until export format is mapped.
 * Uses dedicated DigitalOcean intake server via VAUTO_SFTP_* env vars.
 *
 *   curl "http://localhost:3000/api/import-vauto?secret=YOUR_IMPORT_SECRET"
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function buildResponse(summary: VautoIntakeSummary) {
  return {
    importVersion: IMPORT_API_VERSION,
    mode: summary.mode,
    ok: summary.ok,
    filesProcessed: summary.filesProcessed,
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
    const summary = await runVautoInventoryIntake(supabase);
    return NextResponse.json(buildResponse(summary), {
      status: summary.ok ? 200 : 207,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "vAuto intake failed";
    return NextResponse.json(
      buildResponse(createFailedVautoIntakeSummary(message)),
      { status: 500 },
    );
  }
}
