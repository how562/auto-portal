import { NextResponse } from "next/server";
import { getImportSecret, isImportAuthorized } from "@/lib/import/importAuth";
import { runHomenetInventoryImport } from "@/lib/import/homenetImport";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

/**
 * HomeNet DealerSend inventory import (server-only).
 *
 * Local test (dev server running, .env.local configured):
 *   curl -X POST "http://localhost:3000/api/import-homenet" \
 *     -H "x-import-secret: YOUR_IMPORT_SECRET"
 *
 * Or query param (avoid logging secrets in production):
 *   curl -X POST "http://localhost:3000/api/import-homenet?secret=YOUR_IMPORT_SECRET"
 *
 * Vercel (Production / Preview):
 *   Set env vars: IMPORT_SECRET, SFTP_HOST, SFTP_PORT, SFTP_USER, SFTP_PASSWORD,
 *   SFTP_PATH, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   optional HOMENET_DEFAULT_STORE_ID (uuid from public.stores).
 *
 *   curl -X POST "https://YOUR_DOMAIN/api/import-homenet" \
 *     -H "x-import-secret: $IMPORT_SECRET"
 *
 * Schedule with Vercel Cron (vercel.json), e.g. every 6 hours:
 *   path: /api/import-homenet
 *   Cron requests must include Authorization: Bearer IMPORT_SECRET or
 *   x-import-secret header (configure in Vercel cron settings).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  return handleImport(request);
}

export async function GET(request: Request) {
  return handleImport(request);
}

async function handleImport(request: Request) {
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
    const summary = await runHomenetInventoryImport(supabase);
    return NextResponse.json(summary, { status: summary.ok ? 200 : 207 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "HomeNet import failed";
    return NextResponse.json(
      {
        ok: false,
        error: message,
        rowsProcessed: 0,
        upserted: 0,
        errors: [{ row: 0, message }],
      },
      { status: 500 },
    );
  }
}
