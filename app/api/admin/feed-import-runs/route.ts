import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  getFeedImportRunWithItems,
  listFeedImportRuns,
  type ListFeedImportRunsOptions,
} from "@/lib/feedImportRunsAdmin";
import type { FeedImportRunKind } from "@/lib/inventoryIngestion/types";
import type { InventoryProvider } from "@/lib/inventoryProviders";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

function parseProvider(value: string | null): ListFeedImportRunsOptions["inventoryProvider"] {
  if (value === "homenet" || value === "vauto") return value;
  return "all";
}

function parseRunKind(value: string | null): ListFeedImportRunsOptions["runKind"] {
  if (value === "import" || value === "intake" || value === "reconcile") {
    return value;
  }
  return "all";
}

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
    const inventoryProvider = parseProvider(
      searchParams.get("provider"),
    ) as InventoryProvider | "all";
    const runKind = parseRunKind(searchParams.get("runKind")) as
      | FeedImportRunKind
      | "all";

    const runs = await listFeedImportRuns({
      limit,
      inventoryProvider,
      runKind,
    });
    const latest = runs[0] ?? null;

    return NextResponse.json({ runs, latest });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
