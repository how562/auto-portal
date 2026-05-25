import "server-only";

import { parsePageSectionFromDb } from "./cmsSectionFromDb";
import type { CMSSection } from "./cmsSectionModel";
import { registryHasDedicatedRenderer } from "./cmsSectionRegistry";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";

const PAGE_SELECT = "id, slug, title, status";

export const CMS_DEBUG_SECTION_RAW_SELECT =
  "id, page_id, section_type, is_active, sort_order, title, headline, content, body, subtitle, subheadline, image_url, settings";

export interface CmsDebugPageRow {
  id: string;
  slug: string;
  title: string;
  status: string;
}

export interface CmsDebugRawSectionRow {
  id: string;
  section_type: string;
  is_active: boolean;
  sort_order: number;
  title: string | null;
  headline: string | null;
  content: string | null;
  body: string | null;
  subtitle: string | null;
  subheadline: string | null;
  image_url: string | null;
  settings: unknown;
}

export interface CmsDebugNormalizedRow {
  id: string;
  section_type: string;
  headline: string | null;
  body: string | null;
  subheadline: string | null;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  settings: Record<string, unknown>;
  hasDedicatedRenderer: boolean;
  parseOk: boolean;
}

export interface CmsDebugSectionBundle {
  raw: CmsDebugRawSectionRow;
  normalized: CmsDebugNormalizedRow | null;
  section: CMSSection | null;
}

export interface CmsDebugPayload {
  slug: string;
  page: CmsDebugPageRow | null;
  sections: CmsDebugSectionBundle[];
  error: string | null;
}

function optionalString(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (v == null) return null;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

function normalizeRawSection(row: Record<string, unknown>): CmsDebugRawSectionRow {
  return {
    id: String(row.id ?? ""),
    section_type: String(row.section_type ?? ""),
    is_active: row.is_active !== false,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    title: optionalString(row.title),
    headline: optionalString(row.headline),
    content: optionalString(row.content),
    body: optionalString(row.body),
    subtitle: optionalString(row.subtitle),
    subheadline: optionalString(row.subheadline),
    image_url: optionalString(row.image_url),
    settings: row.settings ?? null,
  };
}

function toNormalizedRow(section: CMSSection): CmsDebugNormalizedRow {
  return {
    id: section.id,
    section_type: section.section_type,
    headline: section.headline,
    body: section.body,
    subheadline: section.subheadline,
    image_url: section.image_url,
    cta_text: section.cta_text,
    cta_url: section.cta_url,
    settings: section.settings ?? {},
    hasDedicatedRenderer: registryHasDedicatedRenderer(section.section_type),
    parseOk: true,
  };
}

export async function fetchCmsDebugBySlug(slug: string): Promise<CmsDebugPayload> {
  const trimmed = slug.trim() || "about-us";

  if (!isSupabaseAdminConfigured()) {
    return {
      slug: trimmed,
      page: null,
      sections: [],
      error: "SUPABASE_SERVICE_ROLE_KEY is not configured.",
    };
  }

  const supabase = getSupabaseAdmin();

  const { data: pageData, error: pageError } = await supabase
    .from("site_pages")
    .select(PAGE_SELECT)
    .eq("slug", trimmed)
    .maybeSingle();

  if (pageError) {
    return {
      slug: trimmed,
      page: null,
      sections: [],
      error: `site_pages: ${pageError.message}`,
    };
  }

  if (!pageData) {
    return { slug: trimmed, page: null, sections: [], error: null };
  }

  const page: CmsDebugPageRow = {
    id: String(pageData.id),
    slug: String(pageData.slug),
    title: String(pageData.title),
    status: String(pageData.status),
  };

  const { data: sectionRows, error: sectionError } = await supabase
    .from("page_sections")
    .select(CMS_DEBUG_SECTION_RAW_SELECT)
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true });

  if (sectionError) {
    return {
      slug: trimmed,
      page,
      sections: [],
      error: `page_sections: ${sectionError.message}`,
    };
  }

  const sections: CmsDebugSectionBundle[] = (sectionRows ?? []).map((row) => {
    const raw = normalizeRawSection(row as Record<string, unknown>);
    const parsed = parsePageSectionFromDb(row as Record<string, unknown>);
    return {
      raw,
      normalized: parsed ? toNormalizedRow(parsed) : null,
      section: parsed,
    };
  });

  return { slug: trimmed, page, sections, error: null };
}
