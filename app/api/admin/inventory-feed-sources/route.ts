import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  listStoreInventorySourceBundles,
  setActiveInventoryFeedSource,
} from "@/lib/inventoryFeedSourcesAdmin";
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
    const bundles = await listStoreInventorySourceBundles();
    return NextResponse.json({ bundles });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface ActivateBody {
  storeId: string;
  feedSourceId: string;
  acknowledgeMismatch?: boolean;
}

export async function POST(request: Request) {
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
    const body = (await request.json()) as ActivateBody;
    if (!body.storeId?.trim() || !body.feedSourceId?.trim()) {
      return NextResponse.json(
        { error: "storeId and feedSourceId are required" },
        { status: 400 },
      );
    }

    await setActiveInventoryFeedSource({
      storeId: body.storeId.trim(),
      feedSourceId: body.feedSourceId.trim(),
      acknowledgeMismatch: body.acknowledgeMismatch,
    });
    const bundles = await listStoreInventorySourceBundles();
    const bundle = bundles.find((b) => b.storeId === body.storeId.trim());
    return NextResponse.json({ ok: true, bundle });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
