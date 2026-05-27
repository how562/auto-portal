import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import { ensureCmsDemoSitePage } from "@/lib/cmsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

/** Ensures the CMS Demo workbench page exists (draft) and returns it for quick edit access. */
export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the dev server." },
      { status: 503 },
    );
  }

  try {
    const page = await ensureCmsDemoSitePage();
    return NextResponse.json({ page });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to open CMS Demo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
