/**
 * @deprecated Import from @/lib/sectionPresetCatalog for full metadata.
 * Re-exports catalog entries for backwards compatibility.
 */

import {
  PRESET_LIBRARY_CATEGORIES,
  SECTION_PRESET_CATALOG,
  getPresetsByCategory,
  type PresetLibraryCategory,
  type SectionPresetCatalogEntry,
} from "./sectionPresetCatalog";

export type PresetStatus = "saved" | "draft";

/** @deprecated Use PresetLibraryCategory */
export type PresetCategory = PresetLibraryCategory;

export interface SectionShowcasePresetMeta {
  section_key: string;
  title: string;
  status: PresetStatus;
  category: PresetCategory;
  recommended_cms_fields: string[];
  default_settings: Record<string, string | boolean | number>;
  layout_variants: string[];
  maps_to_library_type?: string;
  component_path?: string;
}

function toLegacyMeta(entry: SectionPresetCatalogEntry): SectionShowcasePresetMeta {
  return {
    section_key: entry.preset_key,
    title: entry.display_name,
    status: "saved",
    category: entry.library_category,
    recommended_cms_fields: entry.supported_fields,
    default_settings: entry.default_settings,
    layout_variants: entry.layout_variants,
    maps_to_library_type: entry.maps_to_library_type,
    component_path: entry.component_path,
  };
}

const legacyAll = SECTION_PRESET_CATALOG.map(toLegacyMeta);

export const SECTION_SHOWCASE_PRESETS = legacyAll;

export const SAVED_SECTION_PRESETS = legacyAll;

export const DRAFT_SECTION_PRESETS: SectionShowcasePresetMeta[] = [];

function byCat(cat: PresetLibraryCategory) {
  return getPresetsByCategory(cat).map(toLegacyMeta);
}

export const CONTENT_SECTION_PRESETS = byCat("content");
export const GALLERY_SECTION_PRESETS = byCat("galleries");
export const HEADER_SECTION_PRESETS = byCat("page_headers");
export const UTILITY_SECTION_PRESETS = [
  ...byCat("forms_contact"),
  ...byCat("memos_notices"),
];
export const STAFF_SECTION_PRESETS = byCat("staff_dynamic");
export const TESTIMONIAL_SECTION_PRESETS = byCat("social_proof").filter((p) =>
  p.section_key.startsWith("testimonial"),
);
export const REVIEWS_SECTION_PRESETS = byCat("social_proof").filter((p) =>
  p.section_key.startsWith("reviews"),
);
export const PROCESS_SECTION_PRESETS = byCat("process_steps").filter((p) =>
  p.section_key.startsWith("process"),
);
export const TIMELINE_SECTION_PRESETS = byCat("process_steps").filter((p) =>
  p.section_key.startsWith("timeline"),
);
export const LOCATION_SECTION_PRESETS = [
  ...byCat("locations").filter((p) => p.section_key.startsWith("location")),
];
export const MAPS_SECTION_PRESETS = [
  ...byCat("locations").filter((p) => p.section_key.startsWith("map") || p.section_key === "directions_panel"),
];
export const VIDEO_SECTION_PRESETS = byCat("content").filter((p) =>
  p.section_key.startsWith("video"),
);
export const CONVERSION_SECTION_PRESETS = byCat("conversion_cta");
export const MEMOS_SECTION_PRESETS = byCat("memos_notices");
export const FORMS_SECTION_PRESETS = byCat("forms_contact");

export { PRESET_LIBRARY_CATEGORIES, SECTION_PRESET_CATALOG };
