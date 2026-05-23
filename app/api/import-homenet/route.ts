import { NextResponse } from "next/server";
import { getImportSecret, isImportAuthorized } from "@/lib/import/importAuth";
import {
  createFailedImportSummary,
  runHomenetInventoryImport,
} from "@/lib/import/homenetImport";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

/**
 * HomeNet DealerSend inventory import (server-only).
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
export const maxDuration = 60;

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
    const summary = await runHomenetInventoryImport(supabase);
    return NextResponse.json(summary, { status: summary.ok ? 200 : 207 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "HomeNet import failed";
    return NextResponse.json(createFailedImportSummary(message), {
      status: 500,
    });
  }
}
