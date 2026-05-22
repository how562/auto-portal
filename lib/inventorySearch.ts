import { filterVehicles } from "./filterVehicles";
import { getMatchLabel } from "./matchLabels";
import type { ShopperIntent, Vehicle } from "./types";

export type InventoryCondition = "all" | "new" | "used" | "cpo";
export type InventoryBudget =
  | "all"
  | "under-25k"
  | "under-30k"
  | "30-50k"
  | "50k-plus";
export type InventoryBodyStyle =
  | "all"
  | "suv"
  | "truck"
  | "sedan"
  | "coupe"
  | "van";
export type InventoryLifestyle =
  | "all"
  | "family"
  | "work"
  | "luxury"
  | "budget"
  | "first-vehicle"
  | "fuel-efficient";
export type InventorySort = "match" | "value" | "newest";

export interface InventoryFilters {
  condition: InventoryCondition;
  budget: InventoryBudget;
  bodyStyle: InventoryBodyStyle;
  lifestyle: InventoryLifestyle;
  storeId: string;
  sort: InventorySort;
}

export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {
  condition: "all",
  budget: "all",
  bodyStyle: "all",
  lifestyle: "all",
  storeId: "all",
  sort: "match",
};

const LIFESTYLE_TO_INTENT: Record<
  Exclude<InventoryLifestyle, "all">,
  ShopperIntent
> = {
  family: "family-suv",
  work: "work-truck",
  luxury: "luxury",
  budget: "under-30k",
  "first-vehicle": "first-time",
  "fuel-efficient": "fuel-efficient",
};

function haystack(vehicle: Vehicle): string {
  return [vehicle.make, vehicle.model, vehicle.trim, vehicle.body_style]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesBodyStyle(vehicle: Vehicle, body: InventoryBodyStyle): boolean {
  if (body === "all") return true;
  const text = haystack(vehicle);
  switch (body) {
    case "suv":
      return text.includes("suv") || text.includes("crossover");
    case "truck":
      return (
        text.includes("truck") ||
        text.includes("pickup") ||
        text.includes("sierra") ||
        text.includes("f-150")
      );
    case "sedan":
      return text.includes("sedan") || text.includes("car");
    case "coupe":
      return text.includes("coupe");
    case "van":
      return text.includes("van") || text.includes("minivan");
    default:
      return true;
  }
}

function matchesInventoryBudget(
  vehicle: Vehicle,
  budget: InventoryBudget,
): boolean {
  if (budget === "all") return true;
  const price = vehicle.internet_price;
  if (price === null || price <= 0) return false;
  switch (budget) {
    case "under-25k":
      return price < 25000;
    case "under-30k":
      return price < 30000;
    case "30-50k":
      return price >= 30000 && price <= 50000;
    case "50k-plus":
      return price > 50000;
    default:
      return true;
  }
}

function matchesInventoryCondition(
  vehicle: Vehicle,
  condition: InventoryCondition,
): boolean {
  if (condition === "all") return true;
  const c = (vehicle.condition ?? "").toLowerCase();
  if (condition === "cpo") return c === "cpo" || c.includes("certified");
  return c === condition;
}

export function lifestyleToIntent(lifestyle: InventoryLifestyle): ShopperIntent {
  if (lifestyle === "all") return "any";
  return LIFESTYLE_TO_INTENT[lifestyle];
}

export function budgetToHomepageRange(
  budget: InventoryBudget,
): "any" | "under-30k" | "30-50k" | "50k-plus" {
  if (budget === "under-25k" || budget === "under-30k") return "under-30k";
  if (budget === "30-50k") return "30-50k";
  if (budget === "50k-plus") return "50k-plus";
  return "any";
}

export function filterInventoryVehicles(
  vehicles: Vehicle[],
  filters: InventoryFilters,
): Vehicle[] {
  const intent = lifestyleToIntent(filters.lifestyle);
  const budgetRange = budgetToHomepageRange(filters.budget);
  const conditionFilter =
    filters.condition === "all"
      ? "either"
      : filters.condition === "cpo"
        ? "either"
        : filters.condition;

  let result = vehicles.filter(
    (v) =>
      matchesInventoryCondition(v, filters.condition) &&
      matchesInventoryBudget(v, filters.budget) &&
      matchesBodyStyle(v, filters.bodyStyle) &&
      (filters.storeId === "all" || v.store_id === filters.storeId),
  );

  if (filters.lifestyle !== "all") {
    result = filterVehicles(result, intent, budgetRange, conditionFilter);
  } else if (filters.budget !== "all" || filters.condition !== "all") {
    result = filterVehicles(result, "any", budgetRange, conditionFilter);
  }

  return sortInventoryVehicles(result, filters.sort);
}

export function sortInventoryVehicles(
  vehicles: Vehicle[],
  sort: InventorySort,
): Vehicle[] {
  const copy = [...vehicles];
  switch (sort) {
    case "value":
      return copy.sort((a, b) => {
        const priceA = a.internet_price ?? 1e9;
        const priceB = b.internet_price ?? 1e9;
        if (priceA !== priceB) return priceA - priceB;
        return (b.year ?? 0) - (a.year ?? 0);
      });
    case "newest":
      return copy.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    case "match":
    default:
      return copy;
  }
}

export function buildInventorySubtitle(filters: InventoryFilters): string {
  const parts: string[] = [];

  if (filters.lifestyle !== "all") {
    const labels: Record<Exclude<InventoryLifestyle, "all">, string> = {
      family: "family-friendly options",
      work: "work-ready vehicles",
      luxury: "luxury picks",
      budget: "budget-smart choices",
      "first-vehicle": "first-vehicle paths",
      "fuel-efficient": "fuel-efficient options",
    };
    parts.push(labels[filters.lifestyle]);
  }

  if (filters.bodyStyle !== "all") {
    parts.push(`${filters.bodyStyle.toUpperCase()}s`);
  }

  if (filters.budget === "under-25k") parts.push("under $25k");
  else if (filters.budget === "under-30k") parts.push("under $30k");
  else if (filters.budget === "30-50k") parts.push("$30k–$50k");
  else if (filters.budget === "50k-plus") parts.push("$50k+");

  if (filters.condition !== "all") {
    const cond =
      filters.condition === "cpo"
        ? "certified pre-owned"
        : filters.condition;
    parts.push(cond);
  }

  if (parts.length === 0) {
    return "Tell us how you drive—we'll surface vehicles that fit your life across every store.";
  }

  const joined = parts.join(" · ");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

export function getResultMatchLabel(filters: InventoryFilters): string | null {
  if (filters.lifestyle === "all") return null;
  return getMatchLabel(lifestyleToIntent(filters.lifestyle));
}

export interface RefinementSuggestion {
  id: string;
  label: string;
  patch: Partial<InventoryFilters>;
}

export function getRefinementSuggestions(
  filters: InventoryFilters,
): RefinementSuggestion[] {
  const suggestions: RefinementSuggestion[] = [];

  if (filters.bodyStyle !== "suv" && filters.lifestyle !== "family") {
    suggestions.push({
      id: "space",
      label: "Need more space?",
      patch: { bodyStyle: "suv", lifestyle: "family" },
    });
  }

  if (
    filters.budget === "all" ||
    filters.budget === "30-50k" ||
    filters.budget === "50k-plus"
  ) {
    suggestions.push({
      id: "budget",
      label: "Lower your budget?",
      patch: { budget: "under-30k" },
    });
  }

  if (filters.sort !== "newest") {
    suggestions.push({
      id: "newer",
      label: "Prefer newer models?",
      patch: { sort: "newest" },
    });
  }

  if (filters.condition === "all" && suggestions.length < 3) {
    suggestions.push({
      id: "cpo",
      label: "Explore certified options?",
      patch: { condition: "cpo" },
    });
  }

  return suggestions.slice(0, 3);
}

export function filtersToSearchParams(filters: InventoryFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.condition !== "all") params.set("condition", filters.condition);
  if (filters.budget !== "all") params.set("budget", filters.budget);
  if (filters.bodyStyle !== "all") params.set("body", filters.bodyStyle);
  if (filters.lifestyle !== "all") params.set("lifestyle", filters.lifestyle);
  if (filters.storeId !== "all") params.set("store", filters.storeId);
  if (filters.sort !== "match") params.set("sort", filters.sort);
  return params;
}

export function searchParamsToFilters(
  params: URLSearchParams,
): InventoryFilters {
  const condition = params.get("condition");
  const budget = params.get("budget");
  const body = params.get("body");
  const lifestyle = params.get("lifestyle");
  const store = params.get("store");
  const sort = params.get("sort");

  return {
    condition: isCondition(condition) ? condition : "all",
    budget: isBudget(budget) ? budget : "all",
    bodyStyle: isBody(body) ? body : "all",
    lifestyle: isLifestyle(lifestyle) ? lifestyle : "all",
    storeId: store ?? "all",
    sort: normalizeSort(sort),
  };
}

function isCondition(v: string | null): v is InventoryCondition {
  return v === "all" || v === "new" || v === "used" || v === "cpo";
}
function isBudget(v: string | null): v is InventoryBudget {
  return (
    v === "all" ||
    v === "under-25k" ||
    v === "under-30k" ||
    v === "30-50k" ||
    v === "50k-plus"
  );
}
function isBody(v: string | null): v is InventoryBodyStyle {
  return (
    v === "all" ||
    v === "suv" ||
    v === "truck" ||
    v === "sedan" ||
    v === "coupe" ||
    v === "van"
  );
}
function isLifestyle(v: string | null): v is InventoryLifestyle {
  return (
    v === "all" ||
    v === "family" ||
    v === "work" ||
    v === "luxury" ||
    v === "budget" ||
    v === "first-vehicle" ||
    v === "fuel-efficient"
  );
}
function isSort(v: string | null): v is InventorySort {
  return v === "match" || v === "value" || v === "newest";
}

function normalizeSort(v: string | null): InventorySort {
  if (v === "price-asc" || v === "price-desc") return "value";
  if (isSort(v)) return v;
  return "match";
}

/** Map homepage lifestyle choice to inventory URL */
export function lifestyleParamFromHome(
  choice: string,
): InventoryLifestyle | null {
  const map: Record<string, InventoryLifestyle> = {
    family: "family",
    work: "work",
    luxury: "luxury",
    budget: "budget",
    "first-vehicle": "first-vehicle",
    "fuel-efficient": "fuel-efficient",
  };
  return map[choice] ?? null;
}
