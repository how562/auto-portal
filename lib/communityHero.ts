import { COMMUNITY_HERO_FALLBACK } from "./communityHeroFallback";
import type { CommunityHeroContent } from "./communityHeroTypes";
import { fetchPublishedPageBySlug } from "./cmsPages";
import {
  normalizePageSectionRow,
  PAGE_SECTION_SELECT,
} from "./cmsSectionNormalize";
import {
  parseCommunityHeroFromPageSection,
  parseHeadlineLines,
} from "./communityHeroParse";
import { getSupabase } from "./supabase";

export { parseCommunityHeroFromPageSection, parseHeadlineLines };

function parseCommunityHeroRow(
  row: Record<string, unknown>,
): CommunityHeroContent | null {
  const section = normalizePageSectionRow(row);
  if (!section) return null;
  return parseCommunityHeroFromPageSection(section);
}

export async function fetchCommunityHeroFromCMS(): Promise<CommunityHeroContent | null> {
  const page = await fetchPublishedPageBySlug("home");
  if (!page) return null;

  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("page_sections")
    .select(PAGE_SECTION_SELECT)
    .eq("page_id", page.id)
    .eq("section_type", "community_hero")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return parseCommunityHeroRow(data as Record<string, unknown>);
}

export async function getCommunityHeroContent(): Promise<CommunityHeroContent> {
  const cms = await fetchCommunityHeroFromCMS();
  return cms ?? COMMUNITY_HERO_FALLBACK;
}
