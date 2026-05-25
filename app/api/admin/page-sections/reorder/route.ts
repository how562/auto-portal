import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import { swapPageSectionOrder } from "@/lib/cmsAdmin";
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
    const body = (await request.json()) as {
      sectionIdA?: string;
      sectionIdB?: string;
    };
    if (!body.sectionIdA || !body.sectionIdB) {
      return NextResponse.json(
        { error: "sectionIdA and sectionIdB are required" },
        { status: 400 },
      );
    }
    await swapPageSectionOrder(body.sectionIdA, body.sectionIdB);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Reorder failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
