import type { PageSectionUpdateInput } from "./cmsAdmin";
import { getStarterForSectionType } from "./cmsSectionStarters";
import type { CMSSectionType } from "./cmsTypes";
import { getPresetByKey } from "./savedSectionPresets";
import type { SectionPresetCatalogEntry } from "./sectionPresetCatalog";

const PRESET_STORAGE_TYPES = new Set<string>([
  "hero",
  "text_block",
  "image_text",
  "split_feature",
  "cta_band",
  "card_grid",
  "faq",
  "stats",
  "form",
  "locations",
  "custom_html",
]);

function withDefaultDesign(
  settings: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    padding_top: "default",
    padding_bottom: "default",
    margin_top: "none",
    margin_bottom: "none",
    ...settings,
  };
}

function presetHeadline(entry: SectionPresetCatalogEntry): string {
  return entry.display_name;
}

/** Starter payload when adding a catalog preset from the page builder. */
export function getPresetSectionStarter(presetKey: string): PageSectionUpdateInput {
  const entry = getPresetByKey(presetKey);
  if (!entry) {
    throw new Error(`Unknown section preset: ${presetKey}`);
  }

  const storageType = entry.maps_to_library_type;
  const base =
    storageType && PRESET_STORAGE_TYPES.has(storageType)
      ? getStarterForSectionType(storageType as CMSSectionType)
      : {};

  const settings = withDefaultDesign({
    ...(typeof base.settings === "object" && base.settings !== null
      ? (base.settings as Record<string, unknown>)
      : {}),
    ...entry.default_settings,
    preset_key: entry.preset_key,
  });

  const patch: PageSectionUpdateInput = {
    ...base,
    headline: base.headline ?? presetHeadline(entry),
    settings,
  };

  if (entry.layout_variants[0]) {
    patch.layout_variant = entry.layout_variants[0];
  }

  return patch;
}

export function getSectionTypeForPreset(presetKey: string): CMSSectionType {
  const entry = getPresetByKey(presetKey);
  if (!entry?.maps_to_library_type) {
    return "custom_html";
  }
  return entry.maps_to_library_type as CMSSectionType;
}

export function getPresetKeyFromSettings(
  settings: Record<string, unknown> | undefined,
): string | null {
  const key = settings?.preset_key;
  return typeof key === "string" && key.length > 0 ? key : null;
}
