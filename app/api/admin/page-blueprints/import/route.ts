import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import { createSitePageFromBlueprint } from "@/lib/cmsAdmin";
import { sanitizePageBlueprint } from "@/lib/cmsBlueprintSanitize";
import { validatePageBlueprint } from "@/lib/cmsPageBlueprint";
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
    const body = await request.json();
    const result = validatePageBlueprint(body);
    if (!result.ok || !result.blueprint) {
      return NextResponse.json(
        { ok: false, errors: result.errors },
        { status: 400 },
      );
    }

    const blueprint = sanitizePageBlueprint({
      ...result.blueprint,
      status: "draft",
    });
    const created = await createSitePageFromBlueprint(blueprint);
    return NextResponse.json(
      {
        page: created.page,
        sections: created.sections,
        slugUsed: created.slugUsed,
        slugAdjusted: created.slugAdjusted,
        message: created.slugAdjusted
          ? `Slug "${blueprint.slug}" was taken. Page created as /${created.slugUsed}.`
          : undefined,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
