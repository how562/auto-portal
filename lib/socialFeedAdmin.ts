import {
  createPageSection,
  fetchSitePageBySlugAdmin,
  updatePageSection,
} from "./cmsAdmin";
import {
  buildSocialFeedSettings,
  parseSocialFeedFromPageSection,
} from "./socialFeedCms";
import { isSocialFeedPlaceholderMode } from "./socialFeedPlaceholder";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { PAGE_SECTION_SELECT } from "./cmsSectionNormalize";
import { normalizePageSectionRow } from "./cmsSectionNormalize";
import type {
  SocialFeedAdminPayload,
  SocialFeedCmsContent,
} from "./socialFeedTypes";
import type { PageSection } from "./cmsTypes";

async function findSocialFeedSection(
  pageId: string,
): Promise<PageSection | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("page_sections")
    .select(PAGE_SECTION_SELECT)
    .eq("page_id", pageId)
    .eq("section_type", "social_feed")
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return normalizePageSectionRow(data as Record<string, unknown>);
}

async function ensureHomePage(): Promise<{ id: string }> {
  const existing = await fetchSitePageBySlugAdmin("home");
  if (existing) return { id: existing.id };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .insert({
      title: "Home",
      slug: "home",
      status: "published",
      meta_description: "Cavender Auto Group homepage CMS content.",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(`Failed to create home page: ${error?.message ?? "unknown"}`);
  }
  return { id: String(data.id) };
}

async function ensureSocialFeedSection(pageId: string): Promise<PageSection> {
  const existing = await findSocialFeedSection(pageId);
  if (existing) return existing;

  const defaults = parseSocialFeedFromPageSection(null);
  const created = await createPageSection({
    page_id: pageId,
    section_type: "social_feed",
    sort_order: 90,
  });

  return updatePageSection(created.id, {
    headline: defaults.headline,
    subheadline: defaults.description,
    eyebrow: defaults.eyebrow,
    settings: buildSocialFeedSettings(defaults),
    is_active: true,
  });
}

export async function fetchSocialFeedAdminPayload(): Promise<SocialFeedAdminPayload> {
  const page = await fetchSitePageBySlugAdmin("home");
  if (!page) {
    const created = await ensureHomePage();
    const section = await ensureSocialFeedSection(created.id);
    return {
      sectionId: section.id,
      pageId: created.id,
      content: parseSocialFeedFromPageSection(section),
      liveModeEnabled: !isSocialFeedPlaceholderMode(),
    };
  }

  const section = await findSocialFeedSection(page.id);
  return {
    sectionId: section?.id ?? null,
    pageId: page.id,
    content: parseSocialFeedFromPageSection(section),
    liveModeEnabled: !isSocialFeedPlaceholderMode(),
  };
}

export async function saveSocialFeedAdminContent(
  content: SocialFeedCmsContent,
): Promise<SocialFeedAdminPayload> {
  const page = await ensureHomePage();
  const section = await ensureSocialFeedSection(page.id);

  const updated = await updatePageSection(section.id, {
    headline: content.headline,
    subheadline: content.description,
    eyebrow: content.eyebrow,
    settings: buildSocialFeedSettings(content),
    is_active: true,
  });

  return {
    sectionId: updated.id,
    pageId: page.id,
    content: parseSocialFeedFromPageSection(updated),
    liveModeEnabled: !isSocialFeedPlaceholderMode(),
  };
}
