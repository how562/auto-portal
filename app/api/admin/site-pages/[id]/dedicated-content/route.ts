import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import { fetchSitePageById } from "@/lib/cmsAdmin";
import { isDedicatedPageSlug } from "@/lib/dedicatedPageContent";
import {
  fetchAdminDedicatedPageContent,
  saveAdminDedicatedPageContent,
  seedDedicatedPageContentIfEmpty,
} from "@/lib/dedicatedPageContent";
import { getDefaultDedicatedPageContent } from "@/lib/dedicatedPageContent/defaults";
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
      { error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the dev server." },
      { status: 503 },
    );
  }

  try {
    const page = await fetchSitePageById(context.params.id);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    if (!isDedicatedPageSlug(page.slug)) {
      return NextResponse.json(
        { error: "This page does not use a dedicated content layout." },
        { status: 400 },
      );
    }

    await seedDedicatedPageContentIfEmpty(page.id, page.slug);
    const payload = await fetchAdminDedicatedPageContent(page.id);
    if (!payload) {
      return NextResponse.json({ error: "Failed to load page content" }, { status: 500 });
    }

    return NextResponse.json({
      page,
      slug: payload.slug,
      content: payload.content,
      defaults: getDefaultDedicatedPageContent(page.slug),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
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
    if (!isDedicatedPageSlug(page.slug)) {
      return NextResponse.json(
        { error: "This page does not use a dedicated content layout." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as { content?: unknown };
    if (!body.content || typeof body.content !== "object") {
      return NextResponse.json({ error: "content object is required" }, { status: 400 });
    }

    await saveAdminDedicatedPageContent(page.id, body.content as never);
    const payload = await fetchAdminDedicatedPageContent(page.id);

    return NextResponse.json({
      ok: true,
      slug: page.slug,
      content: payload?.content ?? body.content,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
