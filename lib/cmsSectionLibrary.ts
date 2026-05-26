import type { CMSSectionType } from "./cmsTypes";
import {
  getRegistryEntry,
  type CMSSectionRegistryEntry,
} from "./cmsSectionRegistry";

/**
 * Legacy core section types (storage layer for presets via maps_to_library_type).
 * The page builder add-section picker uses all 44 presets from sectionPresetCatalog — see pageBuilderLibrary.ts.
 */
export const CMS_LIBRARY_SECTION_TYPES = [
  "hero",
  "text_block",
  "image_text",
  "split_feature",
  "cta_band",
  "card_grid",
  "faq",
  "stats",
  "locations",
  "inventory_collection",
  "custom_html",
] as const satisfies readonly CMSSectionType[];

export type CMSLibrarySectionType = (typeof CMS_LIBRARY_SECTION_TYPES)[number];

export interface CMSSectionLibraryEntry
  extends Omit<CMSSectionRegistryEntry, "type"> {
  type: CMSLibrarySectionType;
  bestUseCase: string;
  copyGuidance: string;
  imageGuidance: string | null;
  recommendedImageSize: string | null;
  /** Human-readable canonical + settings fields for the library card */
  supportedFieldsList: string[];
}

const LIBRARY_META: Record<
  CMSLibrarySectionType,
  Omit<
    CMSSectionLibraryEntry,
    keyof CMSSectionRegistryEntry | "type" | "supportedFieldsList"
  > & { supportedFieldsList: string[] }
> = {
  hero: {
    bestUseCase:
      "Top of marketing pages — brand story, campaign landing, or section intro with a primary action.",
    copyGuidance:
      "Eyebrow: 2–5 words. Headline: 4–10 words. Subheadline: one sentence (~120 chars). Keep body empty unless you need a second paragraph.",
    imageGuidance:
      "Optional background texture. Use a wide, high-contrast photo; text sits on top at low opacity.",
    recommendedImageSize: "1920×1080 or wider (16:9)",
    supportedFieldsList: [
      "eyebrow",
      "headline",
      "subheadline",
      "body",
      "image_url",
      "cta_text",
      "cta_url",
      "settings.variant",
      "settings.cta_label / cta_href",
    ],
  },
  text_block: {
    bestUseCase: "Policies, about copy, long explanations, or centered statements between visual sections.",
    copyGuidance:
      "Headline optional. Body: 2–4 short paragraphs; separate paragraphs with a blank line.",
    imageGuidance: null,
    recommendedImageSize: null,
    supportedFieldsList: [
      "headline",
      "subheadline",
      "body",
      "settings.alignment (left | center)",
    ],
  },
  image_text: {
    bestUseCase:
      "Explain a service, team story, or feature with supporting photography beside readable copy.",
    copyGuidance:
      "Headline: section title. Subheadline: gold accent line. Body: 2–3 paragraphs max (~400 words).",
    imageGuidance:
      "Use a subject-focused photo with safe crop margins; left/right placement is controlled in settings.",
    recommendedImageSize: "1200×900 (4:3) minimum",
    supportedFieldsList: [
      "headline",
      "subheadline",
      "body",
      "image_url",
      "settings.image_position",
      "settings.media_type",
    ],
  },
  split_feature: {
    bestUseCase: "Two selling points plus a hero image — comparisons, dual benefits, or service pillars.",
    copyGuidance:
      "Page headline centers above the grid. Left/right titles: 3–6 words; bodies: 1–2 sentences each.",
    imageGuidance: "Portrait-friendly photo works best in the tall frame.",
    recommendedImageSize: "1000×1200 (5:4)",
    supportedFieldsList: [
      "headline",
      "image_url",
      "settings.left_title / left_body",
      "settings.right_title / right_body",
      "settings.items[]",
    ],
  },
  cta_band: {
    bestUseCase: "Mid-page conversion — schedule test drive, browse inventory, or contact.",
    copyGuidance:
      "Headline: action-oriented (5–8 words). Subheadline: one supporting sentence. Use settings.buttons for multiple CTAs.",
    imageGuidance: null,
    recommendedImageSize: null,
    supportedFieldsList: [
      "headline",
      "subheadline",
      "settings.buttons[]",
      "settings.variant (dark | light)",
      "settings.cta_label / cta_href",
    ],
  },
  card_grid: {
    bestUseCase: "Programs, departments, blog teasers, or three-up feature highlights.",
    copyGuidance:
      "Section headline + optional subheadline. Each card: title (3–6 words), body (~80 chars), link label.",
    imageGuidance: "Consistent 16:10 crops across all cards for a clean grid.",
    recommendedImageSize: "800×500 per card (16:10)",
    supportedFieldsList: [
      "headline",
      "subheadline",
      "settings.cards[] (title, body, image_url, link_label, link_href)",
    ],
  },
  faq: {
    bestUseCase: "Financing, warranty, hours, or process questions on support pages.",
    copyGuidance:
      "Section headline only in columns; Q&A pairs live in settings.items JSON.",
    imageGuidance: null,
    recommendedImageSize: null,
    supportedFieldsList: ["headline", "subheadline", "settings.items[] (question, answer)"],
  },
  stats: {
    bestUseCase: "Trust metrics — years in business, locations, vehicles sold, NPS.",
    copyGuidance: "Short headline. Each stat: bold value (e.g. 40+) + label (2–4 words).",
    imageGuidance: null,
    recommendedImageSize: null,
    supportedFieldsList: ["headline", "settings.items[] (value, label)"],
  },
  locations: {
    bestUseCase: "Store locator band — pulls live store data from your database.",
    copyGuidance:
      "Headline appears as uppercase label; subheadline is supporting sentence. Store cards are automatic.",
    imageGuidance: null,
    recommendedImageSize: null,
    supportedFieldsList: ["headline", "subheadline"],
  },
  inventory_collection: {
    bestUseCase: "Featured vehicles from a smart collection on landing pages.",
    copyGuidance:
      "Headline + optional subheadline. Pick a collection in settings; vehicles render as a horizontal rail.",
    imageGuidance: "Vehicle photos come from inventory — no section image needed.",
    recommendedImageSize: null,
    supportedFieldsList: [
      "headline",
      "subheadline",
      "settings.collection_id",
      "settings.limit",
    ],
  },
  custom_html: {
    bestUseCase: "Embeds or rich markup that need custom HTML (tables, iframes, legacy content).",
    copyGuidance:
      "Optional headline. Put sanitized HTML in settings.html or body as plain fallback.",
    imageGuidance: null,
    recommendedImageSize: null,
    supportedFieldsList: ["headline", "body", "settings.html"],
  },
};

function buildLibraryEntry(type: CMSLibrarySectionType): CMSSectionLibraryEntry {
  const base = getRegistryEntry(type);
  const meta = LIBRARY_META[type];
  return {
    ...base,
    ...meta,
    type,
    supportedFieldsList: meta.supportedFieldsList,
  };
}

export function listLibrarySectionEntries(): CMSSectionLibraryEntry[] {
  return CMS_LIBRARY_SECTION_TYPES.map(buildLibraryEntry);
}

export function getLibraryEntry(
  type: CMSLibrarySectionType,
): CMSSectionLibraryEntry {
  return buildLibraryEntry(type);
}

export function isLibrarySectionType(
  type: CMSSectionType,
): type is CMSLibrarySectionType {
  return (CMS_LIBRARY_SECTION_TYPES as readonly string[]).includes(type);
}
