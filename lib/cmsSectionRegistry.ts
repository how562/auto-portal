import type { CMSCanonicalFieldKey } from "./cmsSectionModel";
import { CMS_SECTION_TYPES, type CMSSectionType } from "./cmsTypes";

export interface CMSSectionRegistryEntry {
  type: CMSSectionType;
  label: string;
  description: string;
  /** Column fields shown in admin editor */
  editorFields: CMSCanonicalFieldKey[];
  /** Extra settings keys (JSON) managed in type-specific UI */
  settingsKeys: string[];
  hasDedicatedRenderer: boolean;
  /** If false, public site uses generic headline/body fallback only */
  supported: boolean;
}

const F = {
  allCopy: [
    "eyebrow",
    "headline",
    "subheadline",
    "body",
    "headline_es",
    "subheadline_es",
    "body_es",
  ] as CMSCanonicalFieldKey[],
  copyCta: [
    "eyebrow",
    "headline",
    "subheadline",
    "body",
    "cta_text",
    "cta_url",
    "headline_es",
    "subheadline_es",
    "body_es",
    "cta_text_es",
    "cta_url_es",
  ] as CMSCanonicalFieldKey[],
  copyImage: [
    "eyebrow",
    "headline",
    "subheadline",
    "body",
    "image_url",
    "headline_es",
    "subheadline_es",
    "body_es",
    "image_url_es",
  ] as CMSCanonicalFieldKey[],
  headlineOnly: ["headline", "headline_es"] as CMSCanonicalFieldKey[],
};

export const CMS_SECTION_REGISTRY: Record<CMSSectionType, CMSSectionRegistryEntry> = {
  hero: {
    type: "hero",
    label: "Hero",
    description: "Large intro band with headline and optional CTA",
    editorFields: [...F.copyCta, "image_url", "image_url_es"],
    settingsKeys: ["variant", "cta_label", "cta_href", "image_url"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  text_block: {
    type: "text_block",
    label: "Text block",
    description: "Headline and body copy",
    editorFields: F.allCopy,
    settingsKeys: ["alignment"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  image_text: {
    type: "image_text",
    label: "Image + text",
    description: "Split layout: copy plus image or video placeholder",
    editorFields: F.copyImage,
    settingsKeys: ["layout", "image_position", "media_type", "video_title"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  split_feature: {
    type: "split_feature",
    label: "Split feature",
    description: "Two columns with image and feature items",
    editorFields: [...F.headlineOnly, "image_url"],
    settingsKeys: ["items", "left_title", "left_body", "right_title", "right_body"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  cta_band: {
    type: "cta_band",
    label: "CTA band",
    description: "Call-to-action strip with buttons",
    editorFields: ["headline", "subheadline", "headline_es", "subheadline_es"],
    settingsKeys: ["buttons", "cta_label", "cta_href", "variant"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  faq: {
    type: "faq",
    label: "FAQ",
    description: "Question and answer list",
    editorFields: F.headlineOnly,
    settingsKeys: ["items"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  stats: {
    type: "stats",
    label: "Stats",
    description: "Statistic grid",
    editorFields: F.headlineOnly,
    settingsKeys: ["items"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  card_grid: {
    type: "card_grid",
    label: "Card grid",
    description: "Grid of cards from settings.cards",
    editorFields: ["headline", "subheadline", "headline_es", "subheadline_es"],
    settingsKeys: ["cards"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  inventory_collection: {
    type: "inventory_collection",
    label: "Inventory collection",
    description: "Vehicle rail from a smart collection",
    editorFields: F.headlineOnly,
    settingsKeys: ["collection_id", "limit"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  form: {
    type: "form",
    label: "Form",
    description: "Embedded lead form",
    editorFields: F.headlineOnly,
    settingsKeys: ["form_type"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  locations: {
    type: "locations",
    label: "Locations",
    description: "Store locator list",
    editorFields: ["headline", "subheadline", "headline_es", "subheadline_es"],
    settingsKeys: [],
    hasDedicatedRenderer: true,
    supported: true,
  },
  custom_html: {
    type: "custom_html",
    label: "Custom HTML",
    description: "Sanitized HTML block",
    editorFields: ["headline", "body", "headline_es", "body_es"],
    settingsKeys: ["html"],
    hasDedicatedRenderer: true,
    supported: true,
  },
  community_hero: {
    type: "community_hero",
    label: "Community hero",
    description: "Homepage-style collage hero",
    editorFields: ["eyebrow", "headline", "body", "headline_es", "body_es"],
    settingsKeys: ["images"],
    hasDedicatedRenderer: false,
    supported: true,
  },
  top_picks: {
    type: "top_picks",
    label: "Top picks",
    description: "Curated picks rail (generic fallback)",
    editorFields: F.headlineOnly,
    settingsKeys: [],
    hasDedicatedRenderer: false,
    supported: true,
  },
  cavender_commitment: {
    type: "cavender_commitment",
    label: "Cavender commitment",
    description: "Commitment band (generic fallback)",
    editorFields: F.allCopy,
    settingsKeys: [],
    hasDedicatedRenderer: false,
    supported: true,
  },
  social_feed: {
    type: "social_feed",
    label: "Social feed",
    description: "Homepage community carousel backup posts",
    editorFields: ["eyebrow", "headline", "subheadline"],
    settingsKeys: ["posts"],
    hasDedicatedRenderer: false,
    supported: true,
  },
};

export function getRegistryEntry(
  type: CMSSectionType,
): CMSSectionRegistryEntry {
  return CMS_SECTION_REGISTRY[type];
}

export function listRegistryEntriesForBuilder(): CMSSectionRegistryEntry[] {
  return CMS_SECTION_TYPES.filter((t) => CMS_SECTION_REGISTRY[t].supported).map(
    (t) => CMS_SECTION_REGISTRY[t],
  );
}

export function registryHasDedicatedRenderer(type: CMSSectionType): boolean {
  return CMS_SECTION_REGISTRY[type]?.hasDedicatedRenderer ?? false;
}
