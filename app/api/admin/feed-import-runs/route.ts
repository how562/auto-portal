import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  getFeedImportRunWithItems,
  listFeedImportRuns,
} from "@/lib/feedImportRunsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 503 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get("runId")?.trim();

    if (runId) {
      const detail = await getFeedImportRunWithItems(runId);
      if (!detail) {
        return NextResponse.json({ error: "Run not found" }, { status: 404 });
      }
      return NextResponse.json(detail);
    }

    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? 25) || 25),
    );
    const runs = await listFeedImportRuns(limit);
    const latest = runs[0] ?? null;

    return NextResponse.json({ runs, latest });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
