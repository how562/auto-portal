import type { CMSSection } from "./cmsSectionModel";
import type { CMSCanonicalFieldKey } from "./cmsSectionModel";

/** Writes canonical columns only; clears legacy title/content on save. */
export function canonicalSectionToDbPayload(
  patch: Partial<CMSSection>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    title: null,
    subtitle: null,
    content: null,
  };

  const keys: CMSCanonicalFieldKey[] = [
    "eyebrow",
    "headline",
    "subheadline",
    "body",
    "headline_es",
    "subheadline_es",
    "body_es",
    "cta_text_es",
    "image_url",
    "image_url_es",
    "cta_text",
    "cta_url",
    "cta_url_es",
  ];

  for (const key of keys) {
    if (key in patch) {
      const v = patch[key];
      payload[key] = typeof v === "string" ? v.trim() || null : v ?? null;
    }
  }

  if ("settings" in patch && patch.settings !== undefined) {
    payload.settings = patch.settings ?? {};
  }
  if ("is_active" in patch && patch.is_active !== undefined) {
    payload.is_active = patch.is_active;
  }
  if ("sort_order" in patch && patch.sort_order !== undefined) {
    payload.sort_order = patch.sort_order;
  }
  if ("layout_variant" in patch && patch.layout_variant !== undefined) {
    payload.layout_variant = patch.layout_variant?.trim() || null;
  }
  if ("section_type" in patch && patch.section_type !== undefined) {
    payload.section_type = patch.section_type;
  }

  return payload;
}

export function canonicalSectionPatchFromInput(
  input: Record<string, unknown>,
): Partial<CMSSection> {
  const patch: Partial<CMSSection> = {};
  const allowed: (keyof CMSSection)[] = [
    "eyebrow",
    "headline",
    "subheadline",
    "body",
    "headline_es",
    "subheadline_es",
    "body_es",
    "cta_text_es",
    "image_url",
    "image_url_es",
    "cta_text",
    "cta_url",
    "cta_url_es",
    "settings",
    "is_active",
    "sort_order",
    "layout_variant",
    "section_type",
  ];

  for (const key of allowed) {
    if (key in input) {
      (patch as Record<string, unknown>)[key] = input[key];
    }
  }

  return patch;
}
