import type { CMSSection, EnrichedCMSSection } from "./cmsSectionModel";
import type { SitePage } from "./cmsPageTypes";

export const CMS_SECTION_TYPES = [
  "community_hero",
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
  "top_picks",
  "cavender_commitment",
  "social_feed",
] as const;

export type CMSSectionType = (typeof CMS_SECTION_TYPES)[number];

export type { CMSSection, EnrichedCMSSection } from "./cmsSectionModel";
export type { SitePage, AdminSitePageListItem } from "./cmsPageTypes";

/** @deprecated Use CMSSection */
export type PageSection = CMSSection;

/** @deprecated Use EnrichedCMSSection */
export type EnrichedPageSection = EnrichedCMSSection;

export interface CMSPageData {
  page: SitePage;
  sections: CMSSection[];
}

export interface EnrichedCMSPageData {
  page: SitePage;
  sections: EnrichedCMSSection[];
}

/** Slugs handled by dedicated App Router segments — never CMS pages. */
export const RESERVED_CMS_SLUGS = new Set([
  "inventory",
  "admin",
  "api",
  "mathbox-settings",
  "schedule-service",
  "locations",
  "executive-team",
  "cavender-commitment",
  "value-your-trade",
  "finance",
  "finance-center",
  "staff",
  "section-showcase",
  "_next",
  "favicon.ico",
]);
