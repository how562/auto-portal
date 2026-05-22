import { fetchVehiclesForCollection } from "./cmsCollections";
import { parseSettings, settingNumber, settingString } from "./cmsSettings";
import type {
  CMSPageData,
  CMSSectionType,
  EnrichedCMSPageData,
  EnrichedPageSection,
  PageSection,
  SitePage,
} from "./cmsTypes";
import { CMS_SECTION_TYPES } from "./cmsTypes";
import { getSupabase } from "./supabase";
import { fetchStores } from "./stores";
import type { Store } from "./types";

const PAGE_SELECT = "id, slug, title, meta_description, status";
const SECTION_SELECT =
  "id, page_id, section_type, title, subtitle, content, settings, sort_order, is_active";

function isSectionType(value: string): value is CMSSectionType {
  return (CMS_SECTION_TYPES as readonly string[]).includes(value);
}

function normalizeSection(row: Record<string, unknown>): PageSection | null {
  const sectionType = row.section_type;
  if (typeof sectionType !== "string" || !isSectionType(sectionType)) {
    return null;
  }

  const settings =
    row.settings && typeof row.settings === "object" && !Array.isArray(row.settings)
      ? (row.settings as Record<string, unknown>)
      : {};

  return {
    id: String(row.id),
    page_id: String(row.page_id),
    section_type: sectionType,
    title: typeof row.title === "string" ? row.title : null,
    subtitle: typeof row.subtitle === "string" ? row.subtitle : null,
    content: typeof row.content === "string" ? row.content : null,
    settings,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_active: row.is_active !== false,
  };
}

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
    .select(SECTION_SELECT)
    .eq("page_id", pageId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load page sections: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => normalizeSection(row as Record<string, unknown>))
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
