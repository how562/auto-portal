import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  createSitePageFromTemplate,
  type SitePageFromTemplateInput,
} from "@/lib/cmsAdmin";
import { isPageTemplateId } from "@/lib/cmsPageTemplates";
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
    const body = (await request.json()) as SitePageFromTemplateInput;
    if (!isPageTemplateId(body.templateId)) {
      return NextResponse.json({ error: "Invalid templateId" }, { status: 400 });
    }
    const page = await createSitePageFromTemplate(body);
    return NextResponse.json({ page }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
