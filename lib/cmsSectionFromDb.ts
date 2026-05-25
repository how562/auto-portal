import type { CMSSection } from "./cmsSectionModel";
import { CMS_SECTION_TYPES, type CMSSectionType } from "./cmsTypes";
import { settingString } from "./cmsSettings";

export const PAGE_SECTION_SELECT =
  "id, page_id, section_type, title, subtitle, content, settings, sort_order, is_active, eyebrow, headline, subheadline, body, headline_es, subheadline_es, body_es, cta_text_es, image_url, image_url_es, cta_text, cta_url, cta_url_es, layout_variant";

function isSectionType(value: string): value is CMSSectionType {
  return (CMS_SECTION_TYPES as readonly string[]).includes(value);
}

function optionalString(row: Record<string, unknown>, key: string): string | null {
  const v = row[key];
  if (typeof v === "string") return v;
  if (v == null) return null;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
}

/**
 * Single read boundary: legacy title/content/subtitle → canonical headline/body/subheadline.
 */
export function parsePageSectionFromDb(
  row: Record<string, unknown>,
): CMSSection | null {
  const sectionType = row.section_type;
  if (typeof sectionType !== "string" || !isSectionType(sectionType)) {
    return null;
  }

  const settings =
    row.settings && typeof row.settings === "object" && !Array.isArray(row.settings)
      ? (row.settings as Record<string, unknown>)
      : {};

  const legacyTitle = optionalString(row, "title");
  const legacySubtitle = optionalString(row, "subtitle");
  const legacyContent = optionalString(row, "content");

  const headline =
    optionalString(row, "headline") ||
    legacyTitle ||
    settingString(settings, "headline") ||
    null;

  const subheadline =
    optionalString(row, "subheadline") ||
    legacySubtitle ||
    settingString(settings, "subheadline") ||
    null;

  const body =
    optionalString(row, "body") ||
    legacyContent ||
    settingString(settings, "body") ||
    null;

  const eyebrow =
    optionalString(row, "eyebrow") || settingString(settings, "eyebrow") || null;

  const image_url =
    optionalString(row, "image_url") ||
    settingString(settings, "image_url") ||
    null;

  return {
    id: String(row.id),
    page_id: String(row.page_id),
    section_type: sectionType,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_active: row.is_active !== false,
    layout_variant: optionalString(row, "layout_variant"),
    eyebrow,
    headline,
    subheadline,
    body,
    headline_es: optionalString(row, "headline_es"),
    subheadline_es: optionalString(row, "subheadline_es"),
    body_es: optionalString(row, "body_es"),
    cta_text_es: optionalString(row, "cta_text_es"),
    image_url,
    image_url_es: optionalString(row, "image_url_es"),
    cta_text: optionalString(row, "cta_text"),
    cta_url: optionalString(row, "cta_url"),
    cta_url_es: optionalString(row, "cta_url_es"),
    settings,
  };
}
