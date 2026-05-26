import type { ShowcaseCategoryId } from "./sectionShowcaseCatalog";

export type LayoutLibraryPresetId = "showcase-hero";

export interface LayoutLibraryPresetDef {
  id: LayoutLibraryPresetId;
  label: string;
  description: string;
  categoryId: ShowcaseCategoryId;
  bestUseCase: string;
  supportedFields: string[];
  recommendedImageSize: string;
  tags: string[];
}

/** Saved homepage layout blocks — preview-only until wired into homepage layout admin. */
export const LAYOUT_LIBRARY_PRESET_DEFS: LayoutLibraryPresetDef[] = [
  {
    id: "showcase-hero",
    label: "Showcase hero · Slide previews & category chips",
    description:
      "Full-width rounded hero with featured imagery, stacked slide previews, trust row, and lifestyle category chips.",
    categoryId: "homepage-layouts",
    bestUseCase:
      "Modern homepage header inspired by retail showcase layouts — swap in via homepage layout when ready.",
    supportedFields: [
      "Headline & subheadline (text settings / community hero CMS)",
      "Primary CTA + secondary slide links",
      "Hero image slots: center_small, right_tall, bottom_wide",
      "Lifestyle category chips (Shop by Life catalog)",
    ],
    recommendedImageSize:
      "Featured: 800 × 1000 px · Slide thumbs: 400 × 400 px · Category chips: 400 × 500 px",
    tags: ["homepage", "hero", "showcase", "chips", "slides"],
  },
];

export const LAYOUT_LIBRARY_PRESET_COUNT = LAYOUT_LIBRARY_PRESET_DEFS.length;

export function getLayoutLibraryPreset(
  id: string,
): LayoutLibraryPresetDef | undefined {
  return LAYOUT_LIBRARY_PRESET_DEFS.find((p) => p.id === id);
}
