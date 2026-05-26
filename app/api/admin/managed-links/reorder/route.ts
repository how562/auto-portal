import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import { swapManagedLinkSortOrder } from "@/lib/managedLinksAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

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
    const body = (await request.json()) as { link_key?: string; direction?: "up" | "down" };
    const linkKey = body.link_key?.trim();
    if (!linkKey) {
      return NextResponse.json({ error: "link_key is required" }, { status: 400 });
    }
    if (body.direction !== "up" && body.direction !== "down") {
      return NextResponse.json({ error: "direction must be up or down" }, { status: 400 });
    }

    const rows = await swapManagedLinkSortOrder(linkKey, body.direction);
    revalidatePath("/", "layout");
    return NextResponse.json({ rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Reorder failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
