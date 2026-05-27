import { fetchPublishedPageBySlug } from "./cmsPages";
import {
  normalizePageSectionRow,
  PAGE_SECTION_SELECT,
} from "./cmsSectionNormalize";
import { parseSettings, settingItems, settingString } from "./cmsSettings";
import {
  PLACEHOLDER_SOCIAL_POSTS,
  type SocialPlatform,
} from "./socialFeedPlaceholder";
import { getSupabase } from "./supabase";
import type {
  SocialFeedBackupPost,
  SocialFeedCmsContent,
  SocialFeedCmsPayload,
} from "./socialFeedTypes";
import type { PageSection } from "./cmsTypes";

type SocialFeedSectionCopy = {
  eyebrow: string;
  headline: string;
  description: string;
};

const DEFAULT_COPY: SocialFeedSectionCopy = {
  eyebrow: "Community",
  headline: "Around the Cavender Family",
  description:
    "Real moments from our dealerships, our team, and our community.",
};

interface CmsPostRow extends Record<string, unknown> {
  id?: string;
  platform?: string;
  image_url?: string;
  imageSrc?: string;
  caption?: string;
  date_label?: string;
  dateLabel?: string;
  href?: string;
  page_name?: string;
  pageName?: string;
  is_active?: boolean;
  sort_order?: number;
}

function isPlatform(value: string): value is SocialPlatform {
  return value === "facebook" || value === "instagram";
}

function defaultBackupPosts(): SocialFeedBackupPost[] {
  return PLACEHOLDER_SOCIAL_POSTS.map((post, index) => ({
    id: post.id,
    platform: post.platform,
    image_url: post.imageSrc,
    caption: post.caption,
    date_label: post.dateLabel,
    href: post.href,
    page_name: post.pageName,
    is_active: true,
    sort_order: (index + 1) * 10,
  }));
}

function normalizePost(row: CmsPostRow, index: number): SocialFeedBackupPost | null {
  const id = (row.id ?? "").trim() || `social-${index + 1}`;
  const platformRaw = (row.platform ?? "facebook").trim().toLowerCase();
  const platform = isPlatform(platformRaw) ? platformRaw : "facebook";
  const image_url = (row.image_url ?? row.imageSrc ?? "").trim();
  const caption = (row.caption ?? "").trim();
  const date_label = (row.date_label ?? row.dateLabel ?? "").trim();
  const href = (row.href ?? "").trim();
  const page_name = (row.page_name ?? row.pageName ?? "Cavender Auto Group").trim();
  const is_active = row.is_active !== false;
  const sort_order =
    typeof row.sort_order === "number" && !Number.isNaN(row.sort_order)
      ? row.sort_order
      : (index + 1) * 10;

  if (!caption && !image_url) return null;

  return {
    id,
    platform,
    image_url,
    caption,
    date_label,
    href,
    page_name,
    is_active,
    sort_order,
  };
}

export function parseSocialFeedFromPageSection(
  section: PageSection | null,
): SocialFeedCmsContent {
  if (!section) {
    return { ...DEFAULT_COPY, posts: defaultBackupPosts() };
  }

  const settings = parseSettings(section.settings);
  const eyebrow =
    settingString(settings, "eyebrow").trim() ||
    section.eyebrow?.trim() ||
    DEFAULT_COPY.eyebrow;
  const headline =
    section.headline?.trim() ||
    settingString(settings, "headline").trim() ||
    DEFAULT_COPY.headline;
  const description =
    section.subheadline?.trim() ||
    section.body?.trim() ||
    settingString(settings, "description").trim() ||
    DEFAULT_COPY.description;

  const rows = settingItems<CmsPostRow>(settings, "posts");
  const parsed = rows
    .map((row, index) => normalizePost(row, index))
    .filter((post): post is SocialFeedBackupPost => post != null)
    .sort((a, b) => a.sort_order - b.sort_order);

  return {
    eyebrow,
    headline,
    description,
    posts: parsed.length > 0 ? parsed : defaultBackupPosts(),
  };
}

export function buildSocialFeedSettings(
  content: SocialFeedCmsContent,
): Record<string, unknown> {
  return {
    eyebrow: content.eyebrow,
    description: content.description,
    posts: content.posts.map((post) => ({
      id: post.id,
      platform: post.platform,
      image_url: post.image_url,
      caption: post.caption,
      date_label: post.date_label,
      href: post.href,
      page_name: post.page_name,
      is_active: post.is_active,
      sort_order: post.sort_order,
    })),
  };
}

export async function fetchSocialFeedCmsPayload(): Promise<SocialFeedCmsPayload> {
  const page = await fetchPublishedPageBySlug("home");
  if (!page) {
    return {
      pageSection: null,
      content: parseSocialFeedFromPageSection(null),
    };
  }

  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return {
      pageSection: null,
      content: parseSocialFeedFromPageSection(null),
    };
  }

  const { data, error } = await supabase
    .from("page_sections")
    .select(PAGE_SECTION_SELECT)
    .eq("page_id", page.id)
    .eq("section_type", "social_feed")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return {
      pageSection: null,
      content: parseSocialFeedFromPageSection(null),
    };
  }

  const section = normalizePageSectionRow(data as Record<string, unknown>);
  return {
    pageSection: section,
    content: parseSocialFeedFromPageSection(section),
  };
}
