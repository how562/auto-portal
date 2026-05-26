import { getRegistryEntry } from "./cmsSectionRegistry";
import type { CMSSectionType } from "./cmsTypes";
import {
  SECTION_SHOWCASE_PRESET_DEFS,
  type SectionShowcasePresetDef,
} from "./sectionShowcasePresetData";
import {
  getSectionShowcaseEntries,
  type SectionShowcaseEntry,
} from "./sectionShowcasePresets";
import {
  LAYOUT_LIBRARY_PRESET_DEFS,
  type LayoutLibraryPresetDef,
  type LayoutLibraryPresetId,
} from "./layoutLibraryPresets";

export const SHOWCASE_CATEGORIES = [
  {
    id: "homepage-layouts",
    title: "Homepage Layouts",
    description:
      "Saved full-width homepage section designs — preview here and wire into the live homepage when ready.",
  },
  {
    id: "page-headers",
    title: "Page Headers",
    description:
      "Hero bands and top-of-page intros with headline, subheadline, and primary CTA.",
  },
  {
    id: "content",
    title: "Content",
    description:
      "Readable copy blocks, split media layouts, and rich HTML for long-form pages.",
  },
  {
    id: "galleries",
    title: "Galleries",
    description: "Card grids, vehicle rails, and curated visual collections.",
  },
  {
    id: "conversion-cta",
    title: "Conversion / CTA",
    description: "Mid-page strips that drive inventory browse, contact, or discovery.",
  },
  {
    id: "forms-contact",
    title: "Forms / Contact",
    description: "Lead capture and embedded forms tied to shopper intent.",
  },
  {
    id: "staff-dynamic",
    title: "Staff / Dynamic",
    description: "Dynamic rails and homepage-specific blocks fed by inventory or CMS.",
  },
  {
    id: "social-proof",
    title: "Social Proof",
    description: "FAQs, stats, and trust metrics that reinforce credibility.",
  },
  {
    id: "process-steps",
    title: "Process / Steps",
    description: "Multi-column feature bands that explain how something works.",
  },
  {
    id: "comparison",
    title: "Comparison",
    description: "Side-by-side layouts for contrasting offers, columns, or media.",
  },
  {
    id: "locations",
    title: "Locations",
    description: "Store locator grids with address, phone, and website links.",
  },
  {
    id: "memos-notices",
    title: "Memos / Notices",
    description: "Short notices, minimal copy bands, and lightweight announcements.",
  },
] as const;

export type ShowcaseCategoryId = (typeof SHOWCASE_CATEGORIES)[number]["id"];

const IMAGE_SIZE_BY_TYPE: Partial<Record<CMSSectionType, string>> = {
  hero: "1920 × 900 px (background, optional)",
  community_hero: "Collage slots: 800 × 600 px per tile",
  image_text: "1200 × 900 px (4:3 media frame)",
  split_feature: "1000 × 800 px (5:4 feature image)",
  card_grid: "Optional per card — icons or none",
  inventory_collection: "Vehicle primary_image_url from feed",
  cavender_commitment: "900 × 700 px per side image",
};

const USE_CASE_BY_TYPE: Partial<Record<CMSSectionType, string>> = {
  hero: "Top-of-page introduction with optional background image and CTA.",
  text_block: "Policy copy, about narrative, or supporting paragraphs.",
  image_text: "Story section with copy beside photo or video placeholder.",
  split_feature: "Two selling points plus a supporting photograph.",
  cta_band: "Conversion moment between content sections.",
  faq: "Answer common shopper questions without leaving the page.",
  stats: "Highlight key numbers after social proof or hero.",
  card_grid: "Values, services, or benefits in a scannable grid.",
  inventory_collection: "Featured vehicles from a smart collection.",
  form: "Capture leads for general inquiries or campaigns.",
  locations: "Help shoppers find the nearest dealership.",
  custom_html: "Legal disclaimers or markup that needs fine control.",
  community_hero: "Homepage-only collage hero (CMS pages use generic preview).",
  top_picks: "Homepage curated rail (CMS pages use generic preview).",
  cavender_commitment: "Homepage commitment band (CMS pages use generic preview).",
};

/** Explicit category overrides for variants that don't match the type default. */
const CATEGORY_OVERRIDE: Partial<Record<string, ShowcaseCategoryId>> = {
  "text-block-headline-only": "memos-notices",
  "custom-html-simple": "memos-notices",
  "form-headline-only": "memos-notices",
  "community-hero-copy-only": "memos-notices",
  "cavender-commitment-copy-only": "memos-notices",
  "split-feature-standard": "comparison",
  "split-feature-headline-only": "comparison",
  "split-feature-text-columns": "process-steps",
  "top-picks-generic-fallback": "staff-dynamic",
  "inventory-collection-with-vehicles": "galleries",
  "inventory-collection-headline-only": "galleries",
  "inventory-collection-subhead": "galleries",
};

function slugifyPresetKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[·]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function defaultCategoryForType(sectionType: CMSSectionType): ShowcaseCategoryId {
  switch (sectionType) {
    case "hero":
    case "community_hero":
      return "page-headers";
    case "text_block":
    case "image_text":
    case "custom_html":
      return "content";
    case "card_grid":
      return "galleries";
    case "inventory_collection":
      return "staff-dynamic";
    case "cta_band":
      return "conversion-cta";
    case "form":
      return "forms-contact";
    case "faq":
    case "stats":
      return "social-proof";
    case "split_feature":
      return "comparison";
    case "locations":
      return "locations";
    case "top_picks":
      return "staff-dynamic";
    case "cavender_commitment":
      return "social-proof";
    default:
      return "content";
  }
}

export function resolvePresetCategory(
  def: SectionShowcasePresetDef,
  presetKey: string,
): ShowcaseCategoryId {
  return CATEGORY_OVERRIDE[presetKey] ?? defaultCategoryForType(def.section_type);
}

export interface SectionShowcaseCatalogEntry extends SectionShowcaseEntry {
  presetKey: string;
  categoryId: ShowcaseCategoryId;
  bestUseCase: string;
  supportedFields: string[];
  recommendedImageSize: string;
  tags: string[];
}

export interface LayoutLibraryCatalogEntry {
  kind: "layout-library";
  id: LayoutLibraryPresetId;
  presetKey: string;
  label: string;
  description: string;
  categoryId: ShowcaseCategoryId;
  bestUseCase: string;
  supportedFields: string[];
  recommendedImageSize: string;
  tags: string[];
}

export type UnifiedCatalogEntry =
  | (SectionShowcaseCatalogEntry & { kind: "cms" })
  | LayoutLibraryCatalogEntry;

function buildTags(def: SectionShowcasePresetDef, presetKey: string): string[] {
  const tags = new Set<string>([def.section_type, presetKey.split("-")[0] ?? ""]);
  const settings = def.fields.settings ?? {};
  if (settings.variant === "dark") tags.add("dark");
  if (settings.variant === "light") tags.add("light");
  if (settings.layout) tags.add(String(settings.layout));
  if (def.fields.image_url) tags.add("has-image");
  if (def.section_type === "inventory_collection") tags.add("dynamic");
  return Array.from(tags).filter(Boolean);
}

export function getSectionShowcaseCatalogEntries(): SectionShowcaseCatalogEntry[] {
  const base = getSectionShowcaseEntries();
  return SECTION_SHOWCASE_PRESET_DEFS.map((def, index) => {
    const presetKey = slugifyPresetKey(def.variantLabel);
    const registry = getRegistryEntry(def.section_type);
    const categoryId = resolvePresetCategory(def, presetKey);
    const editorFields = registry.editorFields.join(", ");
    const settingsKeys =
      registry.settingsKeys.length > 0
        ? registry.settingsKeys.join(", ")
        : "—";

    return {
      ...base[index],
      presetKey,
      categoryId,
      bestUseCase: USE_CASE_BY_TYPE[def.section_type] ?? registry.description,
      supportedFields: [
        `Columns: ${editorFields}`,
        `Settings: ${settingsKeys}`,
      ],
      recommendedImageSize:
        IMAGE_SIZE_BY_TYPE[def.section_type] ?? "No image required",
      tags: buildTags(def, presetKey),
    };
  });
}

export function getLayoutLibraryCatalogEntries(): LayoutLibraryCatalogEntry[] {
  return LAYOUT_LIBRARY_PRESET_DEFS.map((def) => layoutDefToCatalogEntry(def));
}

function layoutDefToCatalogEntry(
  def: LayoutLibraryPresetDef,
): LayoutLibraryCatalogEntry {
  return {
    kind: "layout-library",
    id: def.id,
    presetKey: def.id,
    label: def.label,
    description: def.description,
    categoryId: def.categoryId,
    bestUseCase: def.bestUseCase,
    supportedFields: def.supportedFields,
    recommendedImageSize: def.recommendedImageSize,
    tags: def.tags,
  };
}

export function getUnifiedCatalogEntries(): UnifiedCatalogEntry[] {
  return [
    ...getLayoutLibraryCatalogEntries(),
    ...getSectionShowcaseCatalogEntries().map((entry) => ({
      ...entry,
      kind: "cms" as const,
    })),
  ];
}

export function groupCatalogByCategory(
  entries: UnifiedCatalogEntry[],
): Array<{
  category: (typeof SHOWCASE_CATEGORIES)[number];
  presets: UnifiedCatalogEntry[];
}> {
  return SHOWCASE_CATEGORIES.map((category) => ({
    category,
    presets: entries.filter((e) => e.categoryId === category.id),
  })).filter((g) => g.presets.length > 0);
}

export function filterCatalogEntries(
  entries: UnifiedCatalogEntry[],
  options: {
    query?: string;
    categoryId?: ShowcaseCategoryId | "all";
  },
): UnifiedCatalogEntry[] {
  const q = options.query?.trim().toLowerCase() ?? "";
  const cat = options.categoryId ?? "all";

  return entries.filter((entry) => {
    if (cat !== "all" && entry.categoryId !== cat) return false;
    if (!q) return true;
    const haystack = [
      entry.label,
      entry.presetKey,
      entry.bestUseCase,
      entry.description,
      ...entry.tags,
      entry.kind === "cms" ? entry.section.section_type : "layout-library",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}
