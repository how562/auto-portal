import {
  DEFAULT_INVENTORY_FILTERS,
  type InventoryBodyStyle,
  type InventoryBudget,
  type InventoryCondition,
  type InventoryFilters,
  type InventoryLifestyle,
} from "@/lib/inventorySearch";

export type SitePageType = "cms" | "inventory";

/** Stored on site_pages.inventory_preset — only non-default dimensions. */
export interface InventoryPagePreset {
  condition?: InventoryCondition;
  budget?: InventoryBudget;
  bodyStyle?: InventoryBodyStyle;
  lifestyle?: InventoryLifestyle;
  storeId?: string;
}

export type InventoryPresetFilterKey = keyof InventoryPagePreset;

const PRESET_KEYS: InventoryPresetFilterKey[] = [
  "condition",
  "budget",
  "bodyStyle",
  "lifestyle",
  "storeId",
];

function isCondition(v: unknown): v is InventoryCondition {
  return v === "all" || v === "new" || v === "used" || v === "cpo";
}

function isBudget(v: unknown): v is InventoryBudget {
  return (
    v === "all" ||
    v === "under-25k" ||
    v === "under-30k" ||
    v === "under-40k" ||
    v === "30-50k" ||
    v === "50k-plus"
  );
}

function isBody(v: unknown): v is InventoryBodyStyle {
  return (
    v === "all" ||
    v === "suv" ||
    v === "truck" ||
    v === "sedan" ||
    v === "coupe" ||
    v === "van"
  );
}

function isLifestyle(v: unknown): v is InventoryLifestyle {
  return (
    v === "all" ||
    v === "family" ||
    v === "work" ||
    v === "luxury" ||
    v === "budget" ||
    v === "first-vehicle" ||
    v === "fuel-efficient" ||
    v === "weekend-ready" ||
    v === "everyday-drive"
  );
}

/** Parse JSON from Supabase into a validated preset (drops invalid / default values). */
export function parseInventoryPagePreset(raw: unknown): InventoryPagePreset {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const preset: InventoryPagePreset = {};

  if (isCondition(obj.condition) && obj.condition !== "all") {
    preset.condition = obj.condition;
  }
  if (isBudget(obj.budget) && obj.budget !== "all") {
    preset.budget = obj.budget;
  }
  const body = obj.bodyStyle ?? obj.body;
  if (isBody(body) && body !== "all") {
    preset.bodyStyle = body;
  }
  if (isLifestyle(obj.lifestyle) && obj.lifestyle !== "all") {
    preset.lifestyle = obj.lifestyle;
  }
  const store =
    typeof obj.storeId === "string"
      ? obj.storeId
      : typeof obj.store === "string"
        ? obj.store
        : null;
  if (store && store !== "all") {
    preset.storeId = store;
  }

  return preset;
}

export function presetToInventoryFilters(
  preset: InventoryPagePreset,
): InventoryFilters {
  return {
    ...DEFAULT_INVENTORY_FILTERS,
    ...(preset.condition ? { condition: preset.condition } : {}),
    ...(preset.budget ? { budget: preset.budget } : {}),
    ...(preset.bodyStyle ? { bodyStyle: preset.bodyStyle } : {}),
    ...(preset.lifestyle ? { lifestyle: preset.lifestyle } : {}),
    ...(preset.storeId ? { storeId: preset.storeId } : {}),
  };
}

export function getLockedInventoryFilterKeys(
  preset: InventoryPagePreset,
): InventoryPresetFilterKey[] {
  return PRESET_KEYS.filter((key) => {
    const value = preset[key];
    if (value == null) return false;
    if (key === "storeId") return value !== "all";
    return value !== "all";
  });
}

export function inventoryPresetHasActiveFilter(
  preset: InventoryPagePreset,
): boolean {
  return getLockedInventoryFilterKeys(preset).length > 0;
}

export function applyInventoryPagePreset(
  filters: InventoryFilters,
  preset: InventoryPagePreset,
): InventoryFilters {
  const locked = presetToInventoryFilters(preset);
  return {
    ...filters,
    condition: locked.condition,
    budget: locked.budget,
    bodyStyle: locked.bodyStyle,
    lifestyle: locked.lifestyle,
    storeId: locked.storeId,
    ...(preset.lifestyle && preset.lifestyle !== filters.lifestyle
      ? { lifeRefinement: null }
      : {}),
  };
}

export function mergeInventoryFiltersWithPreset(
  filters: InventoryFilters,
  preset: InventoryPagePreset,
): InventoryFilters {
  return applyInventoryPagePreset(filters, preset);
}

export function describeInventoryPreset(
  preset: InventoryPagePreset,
): string {
  const parts: string[] = [];
  if (preset.condition === "new") parts.push("New");
  if (preset.condition === "used") parts.push("Pre-owned");
  if (preset.condition === "cpo") parts.push("CPO");
  if (preset.budget && preset.budget !== "all") {
    const labels: Record<string, string> = {
      "under-25k": "Under $25k",
      "under-30k": "Under $30k",
      "under-40k": "Under $40k",
      "30-50k": "$30k–$50k",
      "50k-plus": "$50k+",
    };
    parts.push(labels[preset.budget] ?? preset.budget);
  }
  if (preset.bodyStyle && preset.bodyStyle !== "all") {
    parts.push(preset.bodyStyle.toUpperCase());
  }
  if (preset.lifestyle && preset.lifestyle !== "all") {
    parts.push(preset.lifestyle.replace(/-/g, " "));
  }
  if (preset.storeId) parts.push("Store");
  return parts.length > 0 ? parts.join(" · ") : "No filters set";
}

export const EMPTY_INVENTORY_PRESET: InventoryPagePreset = {};
