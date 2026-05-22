import type { PageSection, SitePage } from "./cmsTypes";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

const PAGE_SELECT = "id, slug, title, meta_description, status";
const SECTION_SELECT =
  "id, page_id, section_type, title, subtitle, content, settings, sort_order, is_active, eyebrow, headline, subheadline, body, image_url, cta_text, cta_url, layout_variant";

function optionalString(row: Record<string, unknown>, key: string): string | null {
  return typeof row[key] === "string" ? row[key] : null;
}

function normalizeSectionRow(row: Record<string, unknown>): PageSection {
  const settings =
    row.settings && typeof row.settings === "object" && !Array.isArray(row.settings)
      ? (row.settings as Record<string, unknown>)
      : {};

  return {
    id: String(row.id),
    page_id: String(row.page_id),
    section_type: String(row.section_type) as PageSection["section_type"],
    title: optionalString(row, "title"),
    subtitle: optionalString(row, "subtitle"),
    content: optionalString(row, "content"),
    settings,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_active: row.is_active !== false,
    eyebrow: optionalString(row, "eyebrow"),
    headline: optionalString(row, "headline"),
    subheadline: optionalString(row, "subheadline"),
    body: optionalString(row, "body"),
    image_url: optionalString(row, "image_url"),
    cta_text: optionalString(row, "cta_text"),
    cta_url: optionalString(row, "cta_url"),
    layout_variant: optionalString(row, "layout_variant"),
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
  return (data ?? []) as SitePage[];
}

export async function fetchSitePageById(pageId: string): Promise<SitePage | null> {
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .eq("id", pageId)
    .maybeSingle();
  if (error) throw new Error(`Failed to load page: ${error.message}`);
  return (data as SitePage | null) ?? null;
}

export async function fetchPageSectionsForAdmin(
  pageId: string,
): Promise<PageSection[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("page_sections")
    .select(SECTION_SELECT)
    .eq("page_id", pageId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to load sections: ${error.message}`);
  return (data ?? []).map((row) =>
    normalizeSectionRow(row as Record<string, unknown>),
  );
}

export interface PageSectionUpdateInput {
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
  image_url?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  layout_variant?: string | null;
}

export async function updatePageSection(
  sectionId: string,
  input: PageSectionUpdateInput,
): Promise<PageSection> {
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase admin is not configured");
  }
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("page_sections")
    .update(input)
    .eq("id", sectionId)
    .select(SECTION_SELECT)
    .single();
  if (error) throw new Error(`Failed to update section: ${error.message}`);
  return normalizeSectionRow(data as Record<string, unknown>);
}
