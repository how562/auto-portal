import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  createBrandingResource,
  deleteBrandingResource,
  listBrandingResource,
  seedBrandingCmsIfEmpty,
  updateBrandingResource,
} from "@/lib/brandingCmsAdmin";
import { isValidBrandingResource } from "@/lib/brandingCmsUtils";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

interface RouteContext {
  params: { resource: string };
}

function adminGuard(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      {
        error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local to edit branding CMS records.",
        code: "ADMIN_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }
  return null;
}

export async function GET(request: Request, context: RouteContext) {
  const denied = adminGuard(request);
  if (denied) return denied;

  const resource = context.params.resource;
  if (resource === "seed") {
    try {
      const seeded = await seedBrandingCmsIfEmpty();
      return NextResponse.json({ seeded });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Seed failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (!isValidBrandingResource(resource)) {
    return NextResponse.json({ error: "Invalid resource" }, { status: 400 });
  }

  try {
    const rows = await listBrandingResource(resource);
    return NextResponse.json({ rows });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const denied = adminGuard(request);
  if (denied) return denied;

  const resource = context.params.resource;
  if (!isValidBrandingResource(resource)) {
    return NextResponse.json({ error: "Invalid resource" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const row = await createBrandingResource(resource, body);
    return NextResponse.json({ row }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface PatchBody {
  id: string;
  updates: Record<string, unknown>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const denied = adminGuard(request);
  if (denied) return denied;

  const resource = context.params.resource;
  if (!isValidBrandingResource(resource)) {
    return NextResponse.json({ error: "Invalid resource" }, { status: 400 });
  }

  try {
    const body = (await request.json()) as PatchBody;
    const id = body.id?.trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    const row = await updateBrandingResource(resource, id, body.updates ?? {});
    return NextResponse.json({ row });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const denied = adminGuard(request);
  if (denied) return denied;

  const resource = context.params.resource;
  if (!isValidBrandingResource(resource)) {
    return NextResponse.json({ error: "Invalid resource" }, { status: 400 });
  }

  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await deleteBrandingResource(resource, id);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
