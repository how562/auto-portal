import { RESERVED_CMS_SLUGS, type PageSection, type SitePage } from "./cmsTypes";
import {
  normalizePageSectionRow,
  PAGE_SECTION_SELECT,
} from "./cmsSectionNormalize";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

const PAGE_SELECT = "id, slug, title, meta_description, status, created_at, updated_at";

export function slugifyPageSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePageRow(row: Record<string, unknown>): SitePage | null {
  const id = typeof row.id === "string" ? row.id : "";
  const slug = typeof row.slug === "string" ? row.slug.trim() : "";
  const title = typeof row.title === "string" ? row.title.trim() : "";
  if (!id || !slug || !title) return null;

  return {
    id,
    slug,
    title,
    meta_description:
      typeof row.meta_description === "string"
        ? row.meta_description.trim() || null
        : null,
    status:
      row.status === "published" || row.status === "draft"
        ? row.status
        : "draft",
  };
}

export async function listAllSitePages(): Promise<SitePage[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .order("slug", { ascending: true });
  if (error) throw new Error(`Failed to list pages: ${error.message}`);
  return (data ?? [])
    .map((row) => normalizePageRow(row as Record<string, unknown>))
    .filter((row): row is SitePage => row != null);
}

export async function fetchSitePageById(pageId: string): Promise<SitePage | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .eq("id", pageId.trim())
    .maybeSingle();
  if (error) throw new Error(`Failed to load page: ${error.message}`);
  if (!data) return null;
  return normalizePageRow(data as Record<string, unknown>);
}

export async function fetchSitePageBySlugAdmin(
  slug: string,
): Promise<SitePage | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .eq("slug", slug.trim())
    .maybeSingle();
  if (error) throw new Error(`Failed to load page: ${error.message}`);
  if (!data) return null;
  return normalizePageRow(data as Record<string, unknown>);
}

export interface SitePageCreateInput {
  title: string;
  slug?: string;
  meta_description?: string | null;
  status?: "draft" | "published";
}

export interface SitePageUpdateInput {
  title?: string;
  slug?: string;
  meta_description?: string | null;
  status?: "draft" | "published";
}

export async function createSitePage(
  input: SitePageCreateInput,
): Promise<SitePage> {
  const title = input.title?.trim();
  if (!title) throw new Error("title is required");

  const slug = slugifyPageSlug(input.slug?.trim() || title);
  if (!slug) throw new Error("slug is required");
  if (RESERVED_CMS_SLUGS.has(slug)) {
    throw new Error(`Slug "${slug}" is reserved for app routes`);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .insert({
      title,
      slug,
      meta_description: input.meta_description?.trim() || null,
      status: input.status ?? "draft",
      updated_at: new Date().toISOString(),
    })
    .select(PAGE_SELECT)
    .single();

  if (error) throw new Error(`Failed to create page: ${error.message}`);
  const row = normalizePageRow(data as Record<string, unknown>);
  if (!row) throw new Error("Created page could not be read");
  return row;
}

export async function updateSitePage(
  pageId: string,
  input: SitePageUpdateInput,
): Promise<SitePage> {
  const id = pageId.trim();
  if (!id) throw new Error("page id is required");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) throw new Error("title cannot be empty");
    payload.title = title;
  }
  if (input.slug !== undefined) {
    const slug = slugifyPageSlug(input.slug);
    if (!slug) throw new Error("slug cannot be empty");
    if (RESERVED_CMS_SLUGS.has(slug)) {
      throw new Error(`Slug "${slug}" is reserved for app routes`);
    }
    payload.slug = slug;
  }
  if (input.meta_description !== undefined) {
    payload.meta_description = input.meta_description?.trim() || null;
  }
  if (input.status !== undefined) {
    payload.status = input.status;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("site_pages").update(payload).eq("id", id);
  if (error) throw new Error(`Failed to update page: ${error.message}`);

  const row = await fetchSitePageById(id);
  if (!row) throw new Error("Updated page could not be read");
  return row;
}

export async function deleteSitePage(pageId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("site_pages")
    .delete()
    .eq("id", pageId.trim());
  if (error) throw new Error(`Failed to delete page: ${error.message}`);
}

export async function fetchPageSectionsForAdmin(
  pageId: string,
  options?: { includeInactive?: boolean },
): Promise<PageSection[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("page_sections")
    .select(PAGE_SECTION_SELECT)
    .eq("page_id", pageId.trim())
    .order("sort_order", { ascending: true });

  if (!options?.includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load sections: ${error.message}`);
  return (data ?? [])
    .map((row) => normalizePageSectionRow(row as Record<string, unknown>))
    .filter((s): s is PageSection => s != null);
}

export async function fetchAllPageSectionsForAdmin(
  pageId: string,
): Promise<PageSection[]> {
  return fetchPageSectionsForAdmin(pageId, { includeInactive: true });
}

export interface PageSectionCreateInput {
  page_id: string;
  section_type: PageSection["section_type"];
  sort_order?: number;
}

export interface PageSectionUpdateInput {
  section_type?: PageSection["section_type"];
  title?: string | null;
  subtitle?: string | null;
  content?: string | null;
  settings?: Record<string, unknown>;
  sort_order?: number;
  is_active?: boolean;
  eyebrow?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  body?: string | null;
  headline_es?: string | null;
  subheadline_es?: string | null;
  body_es?: string | null;
  cta_text_es?: string | null;
  image_url?: string | null;
  image_url_es?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  cta_url_es?: string | null;
  layout_variant?: string | null;
}

export async function createPageSection(
  input: PageSectionCreateInput,
): Promise<PageSection> {
  const pageId = input.page_id.trim();
  if (!pageId) throw new Error("page_id is required");

  const supabase = getSupabaseAdmin();
  const { data: maxRow } = await supabase
    .from("page_sections")
    .select("sort_order")
    .eq("page_id", pageId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder =
    input.sort_order ??
    (typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 10 : 0);

  const { data, error } = await supabase
    .from("page_sections")
    .insert({
      page_id: pageId,
      section_type: input.section_type,
      sort_order: nextOrder,
      is_active: true,
      settings: {},
      updated_at: new Date().toISOString(),
    })
    .select(PAGE_SECTION_SELECT)
    .single();

  if (error) throw new Error(`Failed to create section: ${error.message}`);
  const row = normalizePageSectionRow(data as Record<string, unknown>);
  if (!row) throw new Error("Created section could not be read");
  return row;
}

export async function updatePageSection(
  sectionId: string,
  input: PageSectionUpdateInput,
): Promise<PageSection> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) payload[key] = value;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("page_sections")
    .update(payload)
    .eq("id", sectionId.trim())
    .select(PAGE_SECTION_SELECT)
    .single();

  if (error) throw new Error(`Failed to update section: ${error.message}`);
  const row = normalizePageSectionRow(data as Record<string, unknown>);
  if (!row) throw new Error("Updated section could not be read");
  return row;
}

export async function deletePageSection(sectionId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("page_sections")
    .delete()
    .eq("id", sectionId.trim());
  if (error) throw new Error(`Failed to delete section: ${error.message}`);
}

export async function swapPageSectionOrder(
  sectionIdA: string,
  sectionIdB: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: rows, error } = await supabase
    .from("page_sections")
    .select("id, sort_order")
    .in("id", [sectionIdA.trim(), sectionIdB.trim()]);

  if (error || !rows || rows.length !== 2) {
    throw new Error("Sections not found for reorder");
  }

  const a = rows.find((r) => r.id === sectionIdA.trim());
  const b = rows.find((r) => r.id === sectionIdB.trim());
  if (!a || !b) throw new Error("Sections not found for reorder");

  const now = new Date().toISOString();
  const { error: e1 } = await supabase
    .from("page_sections")
    .update({ sort_order: b.sort_order, updated_at: now })
    .eq("id", a.id);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from("page_sections")
    .update({ sort_order: a.sort_order, updated_at: now })
    .eq("id", b.id);
  if (e2) throw new Error(e2.message);
}
