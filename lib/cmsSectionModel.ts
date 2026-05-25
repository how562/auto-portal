import type { CMSSectionType } from "./cmsTypes";
import type { Store, Vehicle } from "./types";

/** Canonical CMS section — single shape for admin + public (no title/content). */
export interface CMSSection {
  id: string;
  page_id: string;
  section_type: CMSSectionType;
  sort_order: number;
  is_active: boolean;
  layout_variant: string | null;
  eyebrow: string | null;
  headline: string | null;
  subheadline: string | null;
  body: string | null;
  headline_es: string | null;
  subheadline_es: string | null;
  body_es: string | null;
  cta_text_es: string | null;
  image_url: string | null;
  image_url_es: string | null;
  cta_text: string | null;
  cta_url: string | null;
  cta_url_es: string | null;
  settings: Record<string, unknown>;
}

export interface EnrichedCMSSection extends CMSSection {
  vehicles?: Vehicle[];
  stores?: Store[];
}

/** Fields stored in dedicated columns (not settings JSON). */
export const CMS_CANONICAL_FIELD_KEYS = [
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
] as const;

export type CMSCanonicalFieldKey = (typeof CMS_CANONICAL_FIELD_KEYS)[number];

export type CMSLocaleFieldKey = Extract<
  CMSCanonicalFieldKey,
  `${string}_es` | "eyebrow"
>;
