import type { EnrichedCMSSection } from "./cmsSectionModel";
import { getRegistryEntry } from "./cmsSectionRegistry";
import {
  SECTION_SHOWCASE_PRESET_DEFS,
  type SectionShowcasePresetDef,
} from "./sectionShowcasePresetData";
import type { Store, Vehicle } from "./types";

export { SECTION_SHOWCASE_PRESET_DEFS, SHOWCASE_HERO_IMAGES } from "./sectionShowcasePresetData";

const SHOWCASE_PAGE_ID = "section-showcase";

export const SECTION_SHOWCASE_PRESET_COUNT = SECTION_SHOWCASE_PRESET_DEFS.length;

const MOCK_STORES: Store[] = [
  {
    id: "showcase-store-1",
    name: "Cavender Chevrolet",
    city: "San Antonio",
    state: "TX",
    phone: "(210) 555-0100",
    website: "https://example.com",
  },
  {
    id: "showcase-store-2",
    name: "Cavender Ford",
    city: "Boerne",
    state: "TX",
    phone: "(830) 555-0200",
    website: "https://example.com",
  },
];

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "showcase-v-1",
    year: 2024,
    make: "Chevrolet",
    model: "Traverse",
    trim: "LT",
    condition: "New",
    body_style: "SUV",
    stock_number: "DEMO-001",
    internet_price: 42990,
    mileage: 12,
    primary_image_url: "/hero/vehicle.jpg",
  },
  {
    id: "showcase-v-2",
    year: 2023,
    make: "Ford",
    model: "F-150",
    trim: "XLT",
    condition: "Used",
    body_style: "Truck",
    stock_number: "DEMO-002",
    internet_price: 38950,
    mileage: 18420,
    primary_image_url: "/hero/dealership.jpg",
  },
];

function materializePreset(
  def: SectionShowcasePresetDef,
  index: number,
): EnrichedCMSSection {
  const sort_order = (index + 1) * 10;
  const section: EnrichedCMSSection = {
    id: `showcase-${index + 1}-${def.section_type}`,
    page_id: SHOWCASE_PAGE_ID,
    section_type: def.section_type,
    sort_order,
    is_active: true,
    layout_variant: def.fields.layout_variant ?? null,
    eyebrow: def.fields.eyebrow ?? null,
    headline: def.fields.headline ?? null,
    subheadline: def.fields.subheadline ?? null,
    body: def.fields.body ?? null,
    headline_es: def.fields.headline_es ?? null,
    subheadline_es: def.fields.subheadline_es ?? null,
    body_es: def.fields.body_es ?? null,
    cta_text_es: def.fields.cta_text_es ?? null,
    image_url: def.fields.image_url ?? null,
    image_url_es: def.fields.image_url_es ?? null,
    cta_text: def.fields.cta_text ?? null,
    cta_url: def.fields.cta_url ?? null,
    cta_url_es: def.fields.cta_url_es ?? null,
    settings: def.fields.settings ?? {},
    vehicles: def.fields.vehicles,
    stores: def.fields.stores,
  };

  if (
    def.section_type === "inventory_collection" &&
    def.variantLabel.includes("With vehicles")
  ) {
    section.vehicles = MOCK_VEHICLES;
  }

  if (def.section_type === "locations") {
    section.stores =
      def.variantLabel.includes("Two stores") ? MOCK_STORES : MOCK_STORES.slice(0, 1);
  }

  return section;
}

/** All premade showcase sections (44 layout presets). */
export const SECTION_SHOWCASE_PRESETS: EnrichedCMSSection[] =
  SECTION_SHOWCASE_PRESET_DEFS.map(materializePreset);

export interface SectionShowcaseEntry {
  section: EnrichedCMSSection;
  /** Human-readable variant name, e.g. "Hero · Dark with image" */
  label: string;
  sectionTypeLabel: string;
  description: string;
  hasDedicatedRenderer: boolean;
}

export function getSectionShowcaseEntries(): SectionShowcaseEntry[] {
  return SECTION_SHOWCASE_PRESET_DEFS.map((def, index) => {
    const section = SECTION_SHOWCASE_PRESETS[index];
    const entry = getRegistryEntry(def.section_type);
    return {
      section,
      label: def.variantLabel,
      sectionTypeLabel: entry.label,
      description: def.description ?? entry.description,
      hasDedicatedRenderer: entry.hasDedicatedRenderer,
    };
  });
}

export function getSectionShowcaseMockVehicles(): Vehicle[] {
  return MOCK_VEHICLES;
}
