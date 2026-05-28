import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuthConfig";
import {
  fetchHomepageSectionAdmin,
  saveHomepageSectionAdmin,
  type CommitmentSectionFormState,
} from "@/lib/homepageSectionContentAdmin";
import { isHomepageLayoutSectionId } from "@/lib/homepageLayoutRegistry";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import type { SocialFeedCmsContent } from "@/lib/socialFeedTypes";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

interface RouteContext {
  params: { layoutId: string };
}

export async function GET(_request: Request, context: RouteContext) {
  if (!isAdminRequest(_request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Set SUPABASE_SERVICE_ROLE_KEY in .env.local" },
      { status: 503 },
    );
  }

  const layoutId = context.params.layoutId;
  if (!isHomepageLayoutSectionId(layoutId)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  try {
    const payload = await fetchHomepageSectionAdmin(layoutId);
    return NextResponse.json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type PatchBody =
  | { kind: "hero"; content: CommunityHeroContent }
  | { kind: "commitment"; form: CommitmentSectionFormState }
  | { kind: "social_feed"; content: SocialFeedCmsContent };

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

  const layoutId = context.params.layoutId;
  if (!isHomepageLayoutSectionId(layoutId)) {
    return NextResponse.json({ error: "Unknown section" }, { status: 404 });
  }

  try {
    const body = (await request.json()) as PatchBody;
    if (!body?.kind) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const payload = await saveHomepageSectionAdmin(layoutId, body);
    return NextResponse.json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
