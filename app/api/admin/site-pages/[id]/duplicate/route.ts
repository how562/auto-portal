import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  duplicateSitePage,
  type DuplicateSitePageInput,
} from "@/lib/cmsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: Request, context: RouteContext) {
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
    const body = (await request.json()) as DuplicateSitePageInput;
    const page = await duplicateSitePage(context.params.id, body);
    return NextResponse.json({ page }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Duplicate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
