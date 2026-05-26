import type { CMSSectionRegistryEntry } from "./cmsSectionRegistry";
import { getRegistryEntry } from "./cmsSectionRegistry";
import type { CMSSectionType } from "./cmsTypes";
import {
  PRESET_LIBRARY_CATEGORIES,
  SECTION_PRESET_CATALOG,
  type PresetLibraryCategory,
  type SectionPresetCatalogEntry,
} from "./sectionPresetCatalog";

/** Non-preset blocks still available in the page builder (inventory, etc.). */
export const CMS_UTILITY_SECTION_TYPES = ["inventory_collection"] as const;

export type CMSUtilitySectionType = (typeof CMS_UTILITY_SECTION_TYPES)[number];

export type PageBuilderAddTarget =
  | { kind: "preset"; presetKey: string }
  | { kind: "utility"; type: CMSUtilitySectionType };

export interface PageBuilderPresetPickerEntry {
  preset_key: string;
  display_name: string;
  description: string;
  library_category: PresetLibraryCategory;
  category_label: string;
  wireframe_type: CMSSectionType;
  best_use_case: string;
  supported_fields: string[];
  recommended_image_size: string | null;
  library_visibility: SectionPresetCatalogEntry["library_visibility"];
  maps_to_library_type?: string;
}

export interface PageBuilderPickerGroup {
  id: PresetLibraryCategory | "site_integrations";
  label: string;
  description: string;
  sort_order: number;
  presets: PageBuilderPresetPickerEntry[];
}

function categoryLabel(id: PresetLibraryCategory): string {
  return PRESET_LIBRARY_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

function toPickerEntry(entry: SectionPresetCatalogEntry): PageBuilderPresetPickerEntry {
  const wireframe =
    (entry.maps_to_library_type as CMSSectionType | undefined) ?? "custom_html";
  const reg = getRegistryEntry(wireframe);
  return {
    preset_key: entry.preset_key,
    display_name: entry.display_name,
    description: reg.description,
    library_category: entry.library_category,
    category_label: categoryLabel(entry.library_category),
    wireframe_type: wireframe,
    best_use_case: entry.best_use_case,
    supported_fields: entry.supported_fields,
    recommended_image_size: entry.recommended_image_size,
    library_visibility: entry.library_visibility,
    maps_to_library_type: entry.maps_to_library_type,
  };
}

/** All 44 catalog presets, sorted by library category then display name. */
export function listPageBuilderPresets(): PageBuilderPresetPickerEntry[] {
  return [...SECTION_PRESET_CATALOG]
    .sort((a, b) => {
      const orderA =
        PRESET_LIBRARY_CATEGORIES.find((c) => c.id === a.library_category)
          ?.sort_order ?? 99;
      const orderB =
        PRESET_LIBRARY_CATEGORIES.find((c) => c.id === b.library_category)
          ?.sort_order ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.display_name.localeCompare(b.display_name);
    })
    .map(toPickerEntry);
}

export function listPageBuilderPickerGroups(): PageBuilderPickerGroup[] {
  const groups: PageBuilderPickerGroup[] = PRESET_LIBRARY_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    description: cat.description,
    sort_order: cat.sort_order,
    presets: listPageBuilderPresets().filter((p) => p.library_category === cat.id),
  })).filter((g) => g.presets.length > 0);

  const utilities: PageBuilderPresetPickerEntry[] = CMS_UTILITY_SECTION_TYPES.map(
    (type) => {
      const reg = getRegistryEntry(type);
      return {
        preset_key: type,
        display_name: reg.label,
        description: reg.description,
        library_category: "content",
        category_label: "Site integrations",
        wireframe_type: type,
        best_use_case:
          type === "inventory_collection"
            ? "Featured vehicles from a smart collection on landing pages."
            : reg.description,
        supported_fields: [...reg.editorFields, ...reg.settingsKeys.map((k) => `settings.${k}`)],
        recommended_image_size: null,
        library_visibility: "promoted",
      };
    },
  );

  groups.push({
    id: "site_integrations",
    label: "Site integrations",
    description: "Live inventory and data-driven blocks (not layout presets).",
    sort_order: 99,
    presets: utilities,
  });

  return groups.sort((a, b) => a.sort_order - b.sort_order);
}

export function getUtilityRegistryEntry(
  type: CMSUtilitySectionType,
): CMSSectionRegistryEntry {
  return getRegistryEntry(type);
}

export function isUtilitySectionType(type: string): type is CMSUtilitySectionType {
  return (CMS_UTILITY_SECTION_TYPES as readonly string[]).includes(type);
}

export function matchesAddingTarget(
  target: PageBuilderAddTarget | null | undefined,
  presetKey: string,
): boolean {
  if (!target) return false;
  if (target.kind === "preset") return target.presetKey === presetKey;
  return target.kind === "utility" && target.type === presetKey;
}
