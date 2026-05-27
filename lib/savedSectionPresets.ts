import {
  SECTION_PRESET_CATALOG,
  type SectionPresetCatalogEntry,
} from "./sectionPresetCatalog";

export {
  SECTION_PRESET_CATALOG,
  getPickerVisiblePresets,
  PRESET_LIBRARY_CATEGORIES,
  PRESET_CLEANUP_SUMMARY,
} from "./sectionPresetCatalog";

/** All saved preset keys */
export const SAVED_SECTION_PRESET_KEYS = SECTION_PRESET_CATALOG.map((p) => p.preset_key);

export function isSavedSectionPreset(key: string): boolean {
  return SECTION_PRESET_CATALOG.some((p) => p.preset_key === key);
}

export function getPresetByKey(key: string): SectionPresetCatalogEntry | undefined {
  return SECTION_PRESET_CATALOG.find((p) => p.preset_key === key);
}
