import { fetchVehiclesForCollection } from "./cmsCollections";
import { parseSettings, settingNumber, settingString } from "./cmsSettings";
import type {
  CMSPageData,
  EnrichedCMSPageData,
  EnrichedPageSection,
  PageSection,
  SitePage,
} from "./cmsTypes";
import {
  normalizePageSectionRow,
  PAGE_SECTION_SELECT,
} from "./cmsSectionNormalize";
import { getSupabase } from "./supabase";
import { fetchStores } from "./stores";
import type { Store } from "./types";

const PAGE_SELECT = "id, slug, title, meta_description, status";

export async function fetchPublishedPageBySlug(
  slug: string,
): Promise<SitePage | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load page: ${error.message}`);
  }

  return (data as SitePage | null) ?? null;
}

export async function fetchPageSections(pageId: string): Promise<PageSection[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("page_sections")
    .select(PAGE_SECTION_SELECT)
    .eq("page_id", pageId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load page sections: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => normalizePageSectionRow(row as Record<string, unknown>))
    .filter((s): s is PageSection => s !== null);
}

export async function fetchCMSPageBySlug(
  slug: string,
): Promise<CMSPageData | null> {
  const page = await fetchPublishedPageBySlug(slug);
  if (!page) return null;

  const sections = await fetchPageSections(page.id);
  return { page, sections };
}

async function enrichSection(
  section: PageSection,
  stores: Store[],
): Promise<EnrichedPageSection> {
  const settings = parseSettings(section.settings);

  if (section.section_type === "inventory_collection") {
    const collectionId = settingString(settings, "collection_id");
    const limit = settingNumber(settings, "limit", 8);
    const vehicles = collectionId
      ? await fetchVehiclesForCollection(collectionId, limit)
      : [];
    return { ...section, vehicles };
  }

  if (section.section_type === "locations") {
    return { ...section, stores };
  }

  return section;
}

export async function fetchEnrichedCMSPage(
  slug: string,
): Promise<EnrichedCMSPageData | null> {
  const base = await fetchCMSPageBySlug(slug);
  if (!base) return null;

  const needsStores = base.sections.some((s) => s.section_type === "locations");
  const stores = needsStores ? await fetchStores() : [];

  const sections = await Promise.all(
    base.sections.map((section) => enrichSection(section, stores)),
  );

  return { page: base.page, sections };
}
