import type { CMSSectionType, PageSection } from "./cmsTypes";
import { CMS_SECTION_TYPES } from "./cmsTypes";

export const PAGE_SECTION_SELECT =
  "id, page_id, section_type, title, subtitle, content, settings, sort_order, is_active, eyebrow, headline, subheadline, body, headline_es, subheadline_es, body_es, cta_text_es, image_url, image_url_es, cta_text, cta_url, cta_url_es, layout_variant";

function isSectionType(value: string): value is CMSSectionType {
  return (CMS_SECTION_TYPES as readonly string[]).includes(value);
}

export function normalizePageSectionRow(
  row: Record<string, unknown>,
): PageSection | null {
  const sectionType = row.section_type;
  if (typeof sectionType !== "string" || !isSectionType(sectionType)) {
    return null;
  }

  const settings =
    row.settings && typeof row.settings === "object" && !Array.isArray(row.settings)
      ? (row.settings as Record<string, unknown>)
      : {};

  const optionalString = (key: string): string | null =>
    typeof row[key] === "string" ? row[key] : null;

  return {
    id: String(row.id),
    page_id: String(row.page_id),
    section_type: sectionType,
    title: optionalString("title"),
    subtitle: optionalString("subtitle"),
    content: optionalString("content"),
    settings,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_active: row.is_active !== false,
    eyebrow: optionalString("eyebrow"),
    headline: optionalString("headline"),
    subheadline: optionalString("subheadline"),
    body: optionalString("body"),
    headline_es: optionalString("headline_es"),
    subheadline_es: optionalString("subheadline_es"),
    body_es: optionalString("body_es"),
    cta_text_es: optionalString("cta_text_es"),
    image_url: optionalString("image_url"),
    image_url_es: optionalString("image_url_es"),
    cta_text: optionalString("cta_text"),
    cta_url: optionalString("cta_url"),
    cta_url_es: optionalString("cta_url_es"),
    layout_variant: optionalString("layout_variant"),
  };
}
