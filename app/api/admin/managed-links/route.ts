import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  createPortalManagedLink,
  deletePortalManagedLink,
  listPortalManagedLinks,
  updatePortalManagedLink,
  type PortalManagedLinkCreateInput,
  type PortalManagedLinkUpdateInput,
} from "@/lib/managedLinksAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

function revalidatePortal() {
  revalidatePath("/", "layout");
}

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
    const rows = await listPortalManagedLinks();
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
    const body = (await request.json()) as PortalManagedLinkCreateInput;
    const row = await createPortalManagedLink(body);
    revalidatePortal();
    return NextResponse.json({ row });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PatchBody {
  link_key: string;
  updates: PortalManagedLinkUpdateInput;
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
    const linkKey = body.link_key?.trim();
    if (!linkKey) {
      return NextResponse.json({ error: "link_key is required" }, { status: 400 });
    }
    const row = await updatePortalManagedLink(linkKey, body.updates ?? {});
    revalidatePortal();
    return NextResponse.json({ row });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    const status =
      message.includes("No link found") ||
      message.includes("No fields to update") ||
      message.includes("not stored yet")
        ? 404
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const linkKey = searchParams.get("link_key")?.trim();
  if (!linkKey) {
    return NextResponse.json({ error: "link_key query param is required" }, { status: 400 });
  }

  try {
    await deletePortalManagedLink(linkKey);
    revalidatePortal();
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
