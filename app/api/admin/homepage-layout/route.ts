import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  fetchHomepageLayoutAdmin,
  saveHomepageLayoutAdmin,
  type HomepageLayoutAdminPayload,
} from "@/lib/homepageLayoutAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

function unauthorized() {
  return NextResponse.json({ error: "Admin not configured" }, { status: 503 });
}

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) return unauthorized();
  try {
    const layout = await fetchHomepageLayoutAdmin();
    return NextResponse.json({ layout });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) return unauthorized();
  try {
    const body = (await request.json()) as HomepageLayoutAdminPayload;
    const layout = await saveHomepageLayoutAdmin(body);
    return NextResponse.json({ layout });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
