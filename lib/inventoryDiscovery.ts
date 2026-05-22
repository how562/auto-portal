import type { Translator } from "./i18n/translations";
import type { InventoryFilters, InventoryLifestyle } from "@/lib/inventorySearch";
import { lifestyleToIntent } from "@/lib/inventorySearch";
import { getMatchLabel } from "@/lib/matchLabels";
import { filterVehicles } from "@/lib/filterVehicles";
import type { ShopperIntent, Vehicle } from "@/lib/types";

export interface FilterChip {
  id: string;
  label: string;
  patch: Partial<InventoryFilters>;
}

export function getActiveFilterChips(
  filters: InventoryFilters,
  stores: { id: string; name: string }[],
  t?: Translator,
): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.condition !== "all") {
    const labels: Record<string, string> = {
      new: t?.("inventory.filter.new") ?? "New",
      used: t?.("inventory.filter.used") ?? "Pre-owned",
      cpo: t?.("inventory.filter.cpo") ?? "Certified",
    };
    chips.push({
      id: "condition",
      label: labels[filters.condition] ?? filters.condition,
      patch: { condition: "all" },
    });
  }

  if (filters.budget !== "all") {
    const labels: Record<string, string> = {
      "under-25k": "Under $25k",
      "under-30k": "Under $30k",
      "30-50k": "$30k–$50k",
      "50k-plus": "$50k+",
    };
    chips.push({
      id: "budget",
      label: labels[filters.budget] ?? filters.budget,
      patch: { budget: "all" },
    });
  }

  if (filters.bodyStyle !== "all") {
    chips.push({
      id: "body",
      label: filters.bodyStyle.toUpperCase(),
      patch: { bodyStyle: "all" },
    });
  }

  if (filters.lifestyle !== "all") {
    const labels: Record<Exclude<InventoryLifestyle, "all">, string> = {
      family: "Family path",
      work: "Work path",
      luxury: "Luxury path",
      budget: "Value path",
      "first-vehicle": "First vehicle",
      "fuel-efficient": "Efficiency",
    };
    chips.push({
      id: "lifestyle",
      label: labels[filters.lifestyle],
      patch: { lifestyle: "all" },
    });
  }

  if (filters.storeId !== "all") {
    const store = stores.find((s) => s.id === filters.storeId);
    chips.push({
      id: "store",
      label: store?.name ?? (t?.("inventory.chip.selectedStore") ?? "Selected store"),
      patch: { storeId: "all" },
    });
  }

  return chips;
}

const MICROCOPY_BY_INTENT: Record<ShopperIntent, string> = {
  any: "A strong pick across our group",
  "family-suv": "Great for families",
  "work-truck": "Work-ready performance",
  luxury: "Elevated design and comfort",
  "under-30k": "Strong value pick",
  "first-time": "Approachable first pick",
  "fuel-efficient": "Efficiency-forward choice",
};

export function getVehicleMicrocopy(
  vehicle: Vehicle,
  filters: InventoryFilters,
): string {
  if (filters.lifestyle !== "all") {
    return MICROCOPY_BY_INTENT[lifestyleToIntent(filters.lifestyle)];
  }

  const haystack = [vehicle.body_style, vehicle.model, vehicle.trim]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (haystack.includes("truck") || haystack.includes("pickup")) {
    return "Work-ready performance";
  }
  if (haystack.includes("suv") || haystack.includes("van")) {
    return "Great for families";
  }
  if (vehicle.internet_price !== null && vehicle.internet_price < 30000) {
    return "Strong value pick";
  }
  if ((vehicle.year ?? 0) >= new Date().getFullYear() - 2) {
    return "Recent arrival";
  }

  return "Curated for your search";
}

export function getVehicleMatchLabel(
  vehicle: Vehicle,
  filters: InventoryFilters,
  t?: Translator,
): string | undefined {
  if (filters.lifestyle !== "all") {
    return getMatchLabel(lifestyleToIntent(filters.lifestyle), t);
  }

  const intents: ShopperIntent[] = [
    "family-suv",
    "work-truck",
    "under-30k",
    "fuel-efficient",
    "luxury",
  ];

  for (const intent of intents) {
    const matches = filterVehicles([vehicle], intent, "any", "either");
    if (matches.length > 0) {
      return getMatchLabel(intent, t);
    }
  }

  return undefined;
}

/** Best single vehicle to spotlight at top of SRP. */
export function pickSpotlightVehicle(vehicles: Vehicle[]): Vehicle | null {
  if (vehicles.length === 0) return null;
  const featured = pickFeaturedVehicles(vehicles, 1);
  return featured[0] ?? vehicles[0];
}

export function countMoreFilters(filters: InventoryFilters): number {
  let n = 0;
  if (filters.budget !== "all") n += 1;
  if (filters.lifestyle !== "all") n += 1;
  if (filters.storeId !== "all") n += 1;
  return n;
}

export function pickFeaturedVehicles(
  vehicles: Vehicle[],
  count = 2,
): Vehicle[] {
  const scored = vehicles.map((v) => {
    let score = 0;
    if (v.internet_price !== null && v.internet_price < 35000) score += 1;
    if ((v.year ?? 0) >= new Date().getFullYear() - 1) score += 2;
    return { v, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.v);
}

/** Split results into rows for section breaks (grid fatigue). */
export function chunkVehicles<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export const SORT_OPTIONS = [
  { value: "match" as const, label: "Best Match" },
  { value: "value" as const, label: "Best Value" },
  { value: "newest" as const, label: "Newest Arrivals" },
];
