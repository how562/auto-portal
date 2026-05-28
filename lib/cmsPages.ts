import { fetchAllPageSectionsForAdmin, fetchSitePageById } from "./cmsAdmin";
import { fetchVehiclesForCollection } from "./cmsCollections";
import { parseSettings, settingNumber, settingString } from "./cmsSettings";
import { parsePageSectionFromDb, PAGE_SECTION_SELECT } from "./cmsSectionFromDb";
import type { CMSSection, EnrichedCMSSection } from "./cmsSectionModel";
import type {
  CMSPageData,
  EnrichedCMSPageData,
  SitePage,
} from "./cmsTypes";
import { parseInventoryPagePreset } from "./inventorySitePages";
import { getSupabase } from "./supabase";
import { isSupabaseAdminConfigured } from "./supabaseAdmin";
import { fetchStores } from "./stores";
import type { Store } from "./types";

const PAGE_SELECT =
  "id, slug, title, meta_description, status, page_type, inventory_preset";

function parsePublishedSitePage(row: Record<string, unknown>): SitePage | null {
  const id = typeof row.id === "string" ? row.id : null;
  const slug = typeof row.slug === "string" ? row.slug.trim() : "";
  const title = typeof row.title === "string" ? row.title.trim() : "";
  if (!id || !slug || !title) return null;

  const pageType = row.page_type === "inventory" ? "inventory" : "cms";
  return {
    id,
    slug,
    title,
    meta_description:
      typeof row.meta_description === "string"
        ? row.meta_description.trim() || null
        : null,
    status: row.status === "published" ? "published" : "draft",
    page_type: pageType,
    inventory_preset:
      pageType === "inventory"
        ? parseInventoryPagePreset(row.inventory_preset)
        : null,
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

  if (!data) return null;
  return parsePublishedSitePage(data as Record<string, unknown>);
}

export async function fetchPublishedInventoryPageBySlug(
  slug: string,
): Promise<SitePage | null> {
  const page = await fetchPublishedPageBySlug(slug);
  if (!page || page.page_type !== "inventory") return null;
  return page;
}

export async function fetchPageSections(pageId: string): Promise<CMSSection[]> {
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
    .map((row) => parsePageSectionFromDb(row as Record<string, unknown>))
    .filter((s): s is CMSSection => s !== null);
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
  section: CMSSection,
  stores: Store[],
): Promise<EnrichedCMSSection> {
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

/** Admin preview: any status, active sections only. */
export async function fetchEnrichedCMSPageForPreview(
  pageId: string,
): Promise<EnrichedCMSPageData | null> {
  if (!isSupabaseAdminConfigured()) return null;

  const page = await fetchSitePageById(pageId);
  if (!page) return null;

  const sections = (await fetchAllPageSectionsForAdmin(pageId)).filter(
    (s) => s.is_active,
  );

  const needsStores = sections.some((s) => s.section_type === "locations");
  const stores = needsStores ? await fetchStores() : [];

  const enriched = await Promise.all(
    sections.map((section) => enrichSection(section, stores)),
  );

  return { page, sections: enriched };
}
