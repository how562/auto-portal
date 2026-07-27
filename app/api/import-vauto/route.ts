import { NextResponse } from "next/server";
import { getImportSecret, isImportAuthorized } from "@/lib/import/importAuth";
import {
  createFailedVautoIntakeSummary,
  runVautoInventoryIntake,
  type VautoIntakeSummary,
} from "@/lib/import/vautoIntake";
import {
  createFailedVautoImportSummary,
  runVautoInventoryImport,
  type VautoImportSummary,
} from "@/lib/import/vautoImport";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

const IMPORT_API_VERSION = 2;

/**
 * vAuto SFTP inventory import (server-only).
 *
 * Default: full parse + upsert with inventory_provider=vauto (shadow — does not
 * switch the active public source). Optional intake-only mode for header inspection:
 *
 *   curl "http://localhost:3000/api/import-vauto?secret=YOUR_IMPORT_SECRET"
 *   curl "http://localhost:3000/api/import-vauto?secret=…&mode=intake"
 *
 * Uses dedicated DigitalOcean intake server via VAUTO_SFTP_* env vars.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type VautoApiSummary = VautoImportSummary | VautoIntakeSummary;

function buildResponse(summary: VautoApiSummary) {
  return {
    importVersion: IMPORT_API_VERSION,
    mode: summary.mode,
    ok: summary.ok,
    filesProcessed: summary.filesProcessed,
    filesSucceeded: summary.filesSucceeded,
    filesFailed: summary.filesFailed,
    filesSkipped: summary.filesSkipped,
    totalUpserted: summary.totalUpserted,
    ...("totalDeactivated" in summary
      ? { totalDeactivated: summary.totalDeactivated }
      : {}),
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

function resolveMode(request: Request): "import" | "intake" {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode")?.trim().toLowerCase();
  return mode === "intake" ? "intake" : "import";
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

  const mode = resolveMode(request);

  try {
    const supabase = getSupabaseAdmin();
    const summary =
      mode === "intake"
        ? await runVautoInventoryIntake(supabase)
        : await runVautoInventoryImport(supabase);
    return NextResponse.json(buildResponse(summary), {
      status: summary.ok ? 200 : 207,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "vAuto import failed";
    const failed =
      mode === "intake"
        ? createFailedVautoIntakeSummary(message)
        : createFailedVautoImportSummary(message);
    return NextResponse.json(buildResponse(failed), { status: 500 });
  }
}
