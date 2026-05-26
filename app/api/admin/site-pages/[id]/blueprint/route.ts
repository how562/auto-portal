import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  fetchAllPageSectionsForAdmin,
  fetchSitePageById,
} from "@/lib/cmsAdmin";
import {
  blueprintJsonString,
  pageBlueprintFromSitePage,
} from "@/lib/cmsPageBlueprint";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

interface RouteContext {
  params: { id: string };
}

export async function GET(request: Request, context: RouteContext) {
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
    const page = await fetchSitePageById(context.params.id);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const sections = await fetchAllPageSectionsForAdmin(page.id);
    const blueprint = pageBlueprintFromSitePage(page, sections);

    return NextResponse.json({
      blueprint,
      json: blueprintJsonString(blueprint),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
