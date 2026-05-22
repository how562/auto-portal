import type { Store, Vehicle } from "./types";

export const CMS_SECTION_TYPES = [
  "hero",
  "text_block",
  "image_text",
  "split_feature",
  "cta_band",
  "faq",
  "stats",
  "card_grid",
  "inventory_collection",
  "form",
  "locations",
  "custom_html",
] as const;

export type CMSSectionType = (typeof CMS_SECTION_TYPES)[number];

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  status: string;
}

export interface PageSection {
  id: string;
  page_id: string;
  section_type: CMSSectionType;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  settings: Record<string, unknown>;
  sort_order: number;
  is_active: boolean;
}

export interface CMSPageData {
  page: SitePage;
  sections: PageSection[];
}

export interface EnrichedPageSection extends PageSection {
  vehicles?: Vehicle[];
  stores?: Store[];
}

export interface EnrichedCMSPageData {
  page: SitePage;
  sections: EnrichedPageSection[];
}

/** Slugs handled by dedicated App Router segments — never CMS pages. */
export const RESERVED_CMS_SLUGS = new Set([
  "inventory",
  "api",
  "_next",
  "favicon.ico",
]);
