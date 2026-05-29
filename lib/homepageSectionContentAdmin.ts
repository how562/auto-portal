import {
  createPageSection,
  fetchSitePageBySlugAdmin,
  updatePageSection,
  type PageSectionUpdateInput,
} from "./cmsAdmin";
import { COMMITMENT_VALUE_ORDER } from "./cavenderCommitmentTypes";
import { COMMUNITY_HERO_FALLBACK } from "./communityHeroFallback";
import { communityHeroVideoSettingsToRecord } from "./communityHeroVideo";
import { parseCommunityHeroFromPageSection } from "./communityHeroParse";
import type { CommunityHeroContent } from "./communityHeroTypes";
import { parseSettings } from "./cmsSettings";
import {
  normalizePageSectionRow,
  PAGE_SECTION_SELECT,
} from "./cmsSectionNormalize";
import type { CMSSection, CMSSectionType } from "./cmsTypes";
import type { HomepageLayoutSectionId } from "./homepageLayoutRegistry";
import {
  getHomepageSectionEditorMeta,
  type HomepageSectionEditorKind,
} from "./homepageSectionEditorMeta";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { parseSocialFeedFromPageSection } from "./socialFeedCms";
import type { SocialFeedCmsContent } from "./socialFeedTypes";
import { buildSocialFeedSettings } from "./socialFeedCms";

const HOME_SLUG = "home";

const DEFAULT_SORT: Partial<Record<HomepageLayoutSectionId, number>> = {
  editorial_hero: 10,
  cavender_commitment: 80,
  social_feed: 90,
};

export interface HomepageSectionAdminPayload {
  layoutSectionId: HomepageLayoutSectionId;
  editorKind: HomepageSectionEditorKind;
  editable: boolean;
  dataSource: string;
  notEditableReason?: string;
  pageId: string | null;
  sectionId: string | null;
  section: CMSSection | null;
  hero?: CommunityHeroContent;
  socialFeed?: SocialFeedCmsContent;
}

async function ensureHomePage(): Promise<{ id: string }> {
  const existing = await fetchSitePageBySlugAdmin(HOME_SLUG);
  if (existing) return { id: existing.id };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .insert({
      title: "Home",
      slug: HOME_SLUG,
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

async function findSection(
  pageId: string,
  sectionType: CMSSectionType,
): Promise<CMSSection | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("page_sections")
    .select(PAGE_SECTION_SELECT)
    .eq("page_id", pageId)
    .eq("section_type", sectionType)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return normalizePageSectionRow(data as Record<string, unknown>);
}

async function ensureSection(
  pageId: string,
  sectionType: CMSSectionType,
  layoutSectionId: HomepageLayoutSectionId,
): Promise<CMSSection> {
  const existing = await findSection(pageId, sectionType);
  if (existing) return existing;

  const created = await createPageSection({
    page_id: pageId,
    section_type: sectionType,
    sort_order: DEFAULT_SORT[layoutSectionId] ?? 50,
  });

  if (sectionType === "community_hero") {
    const fallback = COMMUNITY_HERO_FALLBACK;
    return updatePageSection(created.id, {
      eyebrow: fallback.eyebrow.label,
      headline: fallback.headlineLines.map((l) => l.text).join("\n"),
      subheadline: fallback.subheadline,
      body: fallback.body,
      settings: {
        eyebrow_url: fallback.eyebrow.url,
        headline_lines: fallback.headlineLines,
        buttons: fallback.buttons,
        images: fallback.images,
        ...communityHeroVideoSettingsToRecord(fallback.video),
      },
      is_active: true,
    });
  }

  if (sectionType === "social_feed") {
    const defaults = parseSocialFeedFromPageSection(null);
    return updatePageSection(created.id, {
      eyebrow: defaults.eyebrow,
      headline: defaults.headline,
      subheadline: defaults.description,
      settings: buildSocialFeedSettings(defaults),
      is_active: true,
    });
  }

  return updatePageSection(created.id, { is_active: true });
}

export async function fetchHomepageSectionAdmin(
  layoutSectionId: HomepageLayoutSectionId,
): Promise<HomepageSectionAdminPayload> {
  const meta = getHomepageSectionEditorMeta(layoutSectionId);

  if (!meta.editable || !meta.cmsSectionType) {
    return {
      layoutSectionId,
      editorKind: meta.editorKind,
      editable: false,
      dataSource: meta.dataSource,
      notEditableReason: meta.notEditableReason,
      pageId: null,
      sectionId: null,
      section: null,
    };
  }

  const page = await ensureHomePage();
  const section = await ensureSection(page.id, meta.cmsSectionType, layoutSectionId);

  const base: HomepageSectionAdminPayload = {
    layoutSectionId,
    editorKind: meta.editorKind,
    editable: true,
    dataSource: meta.dataSource,
    pageId: page.id,
    sectionId: section.id,
    section,
  };

  if (meta.editorKind === "hero") {
    const hero =
      parseCommunityHeroFromPageSection(section) ?? COMMUNITY_HERO_FALLBACK;
    return { ...base, hero: { ...hero, pageSection: section } };
  }

  if (meta.editorKind === "social_feed") {
    return {
      ...base,
      socialFeed: parseSocialFeedFromPageSection(section),
    };
  }

  return base;
}

export function heroContentToPageSectionUpdate(
  content: CommunityHeroContent,
): PageSectionUpdateInput {
  const primary = content.buttons[0];
  const settings = parseSettings(content.pageSection?.settings);

  return {
    eyebrow: content.eyebrow.label,
    headline: content.headlineLines.map((line) => line.text).join("\n"),
    subheadline: content.subheadline,
    body: content.body,
    cta_text: primary?.label ?? null,
    cta_url: primary?.url ?? null,
    settings: {
      ...settings,
      eyebrow_url: content.eyebrow.url,
      headline_lines: content.headlineLines,
      buttons: content.buttons,
      images: content.images.map((img) => ({
        position: img.position,
        url: img.url,
        alt: img.alt,
      })),
      ...communityHeroVideoSettingsToRecord(content.video),
    },
    is_active: true,
  };
}

export interface CommitmentSectionFormState {
  headline: string;
  body: string;
  leftImageUrl: string;
  rightImageUrl: string;
  leftImageAlt: string;
  rightImageAlt: string;
  primaryCtaHref: string;
  secondaryCtaHref: string;
  values: Array<{ id: string; title: string; description: string }>;
}

export function commitmentFormFromSection(
  section: CMSSection,
): CommitmentSectionFormState {
  const settings = parseSettings(section.settings);
  const valuesRaw = Array.isArray(settings.values)
    ? (settings.values as Array<{ id?: string; title?: string; description?: string }>)
    : [];
  const byId = new Map(
    valuesRaw.map((row) => [row.id?.trim().toLowerCase() ?? "", row]),
  );

  return {
    headline: section.headline ?? "",
    body: section.body ?? "",
    leftImageUrl:
      (settings.image_url_left as string) ??
      (settings.left_image_url as string) ??
      "",
    rightImageUrl:
      (settings.image_url_right as string) ??
      (settings.right_image_url as string) ??
      "",
    leftImageAlt: (settings.image_alt_left as string) ?? "",
    rightImageAlt: (settings.image_alt_right as string) ?? "",
    primaryCtaHref: section.cta_url ?? "",
    secondaryCtaHref: (settings.secondary_cta_href as string) ?? "",
    values: COMMITMENT_VALUE_ORDER.map((id) => {
      const row = byId.get(id);
      return {
        id,
        title: row?.title ?? "",
        description: row?.description ?? "",
      };
    }),
  };
}

export function commitmentFormToPageSectionUpdate(
  form: CommitmentSectionFormState,
  existingSettings: Record<string, unknown>,
): PageSectionUpdateInput {
  return {
    headline: form.headline,
    body: form.body,
    cta_url: form.primaryCtaHref || null,
    settings: {
      ...existingSettings,
      image_url_left: form.leftImageUrl,
      image_url_right: form.rightImageUrl,
      image_alt_left: form.leftImageAlt,
      image_alt_right: form.rightImageAlt,
      secondary_cta_href: form.secondaryCtaHref,
      values: form.values,
    },
    is_active: true,
  };
}

export async function saveHomepageSectionAdmin(
  layoutSectionId: HomepageLayoutSectionId,
  body:
    | { kind: "hero"; content: CommunityHeroContent }
    | { kind: "commitment"; form: CommitmentSectionFormState }
    | { kind: "social_feed"; content: SocialFeedCmsContent },
): Promise<HomepageSectionAdminPayload> {
  const current = await fetchHomepageSectionAdmin(layoutSectionId);
  if (!current.editable || !current.sectionId || !current.section) {
    throw new Error(current.notEditableReason ?? "Section is not editable");
  }

  let update: PageSectionUpdateInput;

  if (body.kind === "hero" && current.editorKind === "hero") {
    update = heroContentToPageSectionUpdate(body.content);
  } else if (body.kind === "commitment" && current.editorKind === "commitment") {
    update = commitmentFormToPageSectionUpdate(
      body.form,
      parseSettings(current.section.settings),
    );
  } else if (body.kind === "social_feed" && current.editorKind === "social_feed") {
    update = {
      eyebrow: body.content.eyebrow,
      headline: body.content.headline,
      subheadline: body.content.description,
      settings: buildSocialFeedSettings(body.content),
      is_active: true,
    };
  } else {
    throw new Error("Invalid save payload for section");
  }

  await updatePageSection(current.sectionId, update);
  return fetchHomepageSectionAdmin(layoutSectionId);
}
