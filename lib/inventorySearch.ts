import type { Translator } from "./i18n/translations";
import {
  buildInventoryUrl,
  filterVehiclesByIntent,
  filtersFromShopperSelection,
  type InventoryMatchFilters,
  type MatchBodyStyle,
  type MatchBudget,
  type MatchCondition,
  type MatchLifestyle,
} from "./inventoryMatch";
import type { SmartMatchRulesCatalog } from "./smartMatchRulesTypes";
import { getMatchLabel } from "./matchLabels";
import type {
  BudgetRange,
  ConditionFilter,
  ShopperIntent,
  Vehicle,
} from "./types";

export type InventoryCondition = "all" | "new" | "used" | "cpo";
export type InventoryBudget =
  | "all"
  | "under-25k"
  | "under-30k"
  | "under-40k"
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

const INVENTORY_LIFESTYLE_TO_MATCH: Record<InventoryLifestyle, MatchLifestyle> = {
  all: "any",
  family: "family",
  work: "work",
  luxury: "luxury",
  budget: "budget",
  "first-vehicle": "first",
  "fuel-efficient": "efficient",
};

const INVENTORY_BUDGET_TO_MATCH: Record<InventoryBudget, MatchBudget> = {
  all: "any",
  "under-25k": "under-25k",
  "under-30k": "under-30k",
  "under-40k": "under-40k",
  "30-50k": "30-50k",
  "50k-plus": "50k-plus",
};

const INVENTORY_CONDITION_TO_MATCH: Record<
  InventoryCondition,
  MatchCondition
> = {
  all: "any",
  new: "new",
  used: "used",
  cpo: "cpo",
};

const INVENTORY_BODY_TO_MATCH: Record<InventoryBodyStyle, MatchBodyStyle> = {
  all: "any",
  suv: "suv",
  truck: "truck",
  sedan: "sedan",
  coupe: "coupe",
  van: "van",
};

function inventoryFiltersToMatch(
  filters: InventoryFilters,
): InventoryMatchFilters {
  return {
    lifestyle: INVENTORY_LIFESTYLE_TO_MATCH[filters.lifestyle],
    budget: INVENTORY_BUDGET_TO_MATCH[filters.budget],
    condition: INVENTORY_CONDITION_TO_MATCH[filters.condition],
    body_style: INVENTORY_BODY_TO_MATCH[filters.bodyStyle],
    store_id: filters.storeId !== "all" ? filters.storeId : undefined,
  };
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
  smartMatchCatalog?: SmartMatchRulesCatalog,
): Vehicle[] {
  const result = filterVehiclesByIntent(
    vehicles,
    inventoryFiltersToMatch(filters),
    smartMatchCatalog,
  );
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

export function buildInventorySubtitle(
  filters: InventoryFilters,
  t?: Translator,
): string {
  const parts: string[] = [];

  if (filters.lifestyle !== "all") {
    const labels: Record<Exclude<InventoryLifestyle, "all">, string> = {
      family: t?.("inventory.subtitle.family") ?? "family-friendly options",
      work: t?.("inventory.subtitle.work") ?? "work-ready vehicles",
      luxury: t?.("inventory.subtitle.luxury") ?? "luxury picks",
      budget: t?.("inventory.subtitle.budget") ?? "budget-smart choices",
      "first-vehicle":
        t?.("inventory.subtitle.firstVehicle") ?? "first-vehicle paths",
      "fuel-efficient":
        t?.("inventory.subtitle.fuelEfficient") ?? "fuel-efficient options",
    };
    parts.push(labels[filters.lifestyle]);
  }

  if (filters.bodyStyle !== "all") {
    parts.push(`${filters.bodyStyle.toUpperCase()}s`);
  }

  if (filters.budget === "under-25k") parts.push("under $25k");
  else if (filters.budget === "under-30k") parts.push("under $30k");
  else if (filters.budget === "under-40k") parts.push("under $40k");
  else if (filters.budget === "30-50k") parts.push("$30k–$50k");
  else if (filters.budget === "50k-plus") parts.push("$50k+");

  if (filters.condition !== "all") {
    const cond =
      filters.condition === "cpo"
        ? (t?.("inventory.subtitle.cpo") ?? "certified pre-owned")
        : filters.condition === "new"
          ? (t?.("inventory.filter.new") ?? "new")
          : filters.condition === "used"
            ? (t?.("inventory.filter.used") ?? "used")
            : filters.condition;
    parts.push(cond);
  }

  if (parts.length === 0) {
    return (
      t?.("inventory.subtitleDefault") ??
      "Tell us how you drive—we'll surface vehicles that fit your life across every store."
    );
  }

  const joined = parts.join(" · ");
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

export function getResultMatchLabel(
  filters: InventoryFilters,
  t?: Translator,
): string | null {
  if (filters.lifestyle === "all") return null;
  return getMatchLabel(lifestyleToIntent(filters.lifestyle), t);
}

export interface RefinementSuggestion {
  id: string;
  label: string;
  patch: Partial<InventoryFilters>;
}

export function getRefinementSuggestions(
  filters: InventoryFilters,
  t?: Translator,
): RefinementSuggestion[] {
  const suggestions: RefinementSuggestion[] = [];

  if (filters.bodyStyle !== "suv" && filters.lifestyle !== "family") {
    suggestions.push({
      id: "space",
      label: t?.("inventory.refine.needSpace") ?? "Need more space?",
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
      label: t?.("inventory.refine.lowerBudget") ?? "Lower your budget?",
      patch: { budget: "under-30k" },
    });
  }

  if (filters.sort !== "newest") {
    suggestions.push({
      id: "newer",
      label: t?.("inventory.refine.newerModels") ?? "Prefer newer models?",
      patch: { sort: "newest" },
    });
  }

  if (filters.condition === "all" && suggestions.length < 3) {
    suggestions.push({
      id: "cpo",
      label: t?.("inventory.refine.cpo") ?? "Explore certified options?",
      patch: { condition: "cpo" },
    });
  }

  return suggestions.slice(0, 3);
}

export function hasActiveInventoryFilters(filters: InventoryFilters): boolean {
  return (
    filters.condition !== "all" ||
    filters.budget !== "all" ||
    filters.bodyStyle !== "all" ||
    filters.lifestyle !== "all" ||
    filters.storeId !== "all"
  );
}

export function parseInventoryPage(value: string | null | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function paginateInventoryResults<T>(
  items: T[],
  page: number,
  pageSize = 20,
): {
  items: T[];
  totalCount: number;
  page: number;
  totalPages: number;
  pageSize: number;
} {
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    totalCount,
    page: safePage,
    totalPages,
    pageSize,
  };
}

export function filtersToSearchParams(
  filters: InventoryFilters,
  page?: number,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.condition !== "all") params.set("condition", filters.condition);
  if (filters.budget !== "all") params.set("budget", filters.budget);
  if (filters.bodyStyle !== "all") params.set("body", filters.bodyStyle);
  if (filters.lifestyle !== "all") params.set("lifestyle", filters.lifestyle);
  if (filters.storeId !== "all") params.set("store", filters.storeId);
  if (filters.sort !== "match") params.set("sort", filters.sort);
  if (page && page > 1) params.set("page", String(page));
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
    v === "under-40k" ||
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

/** Build /inventory query from Smart Match / guided discovery selections. */
export function buildGuidedDiscoveryInventoryUrl(
  intent: ShopperIntent,
  budget: BudgetRange,
  condition: ConditionFilter,
): string {
  return buildInventoryUrl(filtersFromShopperSelection(intent, budget, condition));
}
