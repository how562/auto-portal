import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import {
  listPortalTextSettings,
  updatePortalTextSetting,
  type PortalTextSettingUpdateInput,
} from "@/lib/textSettingsAdmin";

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
    const rows = await listPortalTextSettings();
    return NextResponse.json({ rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PatchBody {
  text_key: string;
  updates: PortalTextSettingUpdateInput;
}

export async function PATCH(request: Request) {
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
    const body = (await request.json()) as PatchBody;
    const textKey = body.text_key?.trim();
    if (!textKey) {
      return NextResponse.json({ error: "text_key is required" }, { status: 400 });
    }
    const row = await updatePortalTextSetting(textKey, body.updates ?? {});
    return NextResponse.json({ row });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
