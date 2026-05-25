import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  createHomepageSection,
  listHomepageSectionsAdmin,
  swapHomepageSectionOrder,
  updateHomepageSection,
  type HomepageSectionCreateInput,
  type HomepageSectionUpdateInput,
} from "@/lib/homepageSectionsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

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
    const rows = await listHomepageSectionsAdmin();
    return NextResponse.json({ rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const body = (await request.json()) as HomepageSectionCreateInput & {
      action?: string;
      swapA?: string;
      swapB?: string;
    };

    if (body.action === "swap_order") {
      const swapA = body.swapA?.trim();
      const swapB = body.swapB?.trim();
      if (!swapA || !swapB) {
        return NextResponse.json(
          { error: "swapA and swapB are required" },
          { status: 400 },
        );
      }
      await swapHomepageSectionOrder(swapA, swapB);
      const rows = await listHomepageSectionsAdmin();
      return NextResponse.json({ rows });
    }

    const row = await createHomepageSection(body);
    return NextResponse.json({ row }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PatchBody {
  id: string;
  updates: HomepageSectionUpdateInput;
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
    const id = body.id?.trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const row = await updateHomepageSection(id, body.updates ?? {});
    return NextResponse.json({ row });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
