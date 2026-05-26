import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  createPageSection,
  isValidPageUuid,
  type PageSectionCreateInput,
} from "@/lib/cmsAdmin";
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
    const body = (await request.json()) as PageSectionCreateInput;
    if (!body.page_id?.trim()) {
      return NextResponse.json({ error: "page_id is required" }, { status: 400 });
    }
    if (!isValidPageUuid(body.page_id)) {
      return NextResponse.json(
        { error: "Invalid page_id. Open the page from Admin → Site pages." },
        { status: 400 },
      );
    }
    const section = await createPageSection(body);
    return NextResponse.json({ section }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
