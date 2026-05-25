import type { Translator } from "./i18n/translations";
import type { Locale } from "./i18n/types";
import {
  buildInventoryUrl,
  filterVehiclesByIntent,
  filtersFromShopperSelection,
  getSmartMatchResults,
  normalizeVehicle,
  type InventoryMatchFilters,
  type MatchBodyStyle,
  type MatchBudget,
  type MatchCondition,
  type MatchLifestyle,
} from "./inventoryMatch";
import {
  getLifeCategory,
  getLifeEmptyState,
  getLifeResultMessaging,
  getLocalizedLifeCategory,
  getLocalizedLifeRefinementLabel,
  isLifeCategoryId,
  vehicleMatchesLifeCategory,
  vehicleMatchesLifeRefinement,
  type LifeCategoryId,
} from "./lifeFilters";
import { getMatchLabel } from "./matchLabels";
import { FALLBACK_SMART_MATCH_CATALOG } from "./smartMatchRulesFallback";
import type { SmartMatchRulesCatalog } from "./smartMatchRulesTypes";
import type {
  BudgetRange,
  ConditionFilter,
  ShopperIntent,
  Vehicle,
} from "./types";
import { sortVehiclesByMerchandisingQuality } from "./vehicleQuality";

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
  | "fuel-efficient"
  | "weekend-ready"
  | "everyday-drive";
/**
 * Underlying sort vocabulary shared by customer and admin code paths.
 *
 * Customer-facing UI exposes a friendly subset:
 *   `merchandised` (shown as "Featured"), `value`, `newest`.
 *
 * Admin tools also expose the merchandising operations:
 *   `merchandised`, `photos`, `needs-attention`, `newest-added`.
 *
 * The admin labels ("Best Merchandised", "Most Photos", "Needs
 * Attention", "Newest Added") are NEVER rendered to shoppers — see
 * `CUSTOMER_SORT_OPTIONS` and `ADMIN_SORT_OPTIONS` in
 * `lib/inventoryDiscovery.ts`. `match` is kept as a legacy alias.
 */
export type InventorySort =
  | "merchandised"
  | "photos"
  | "needs-attention"
  | "newest-added"
  | "value"
  | "newest"
  | "match";

export interface InventoryFilters {
  condition: InventoryCondition;
  budget: InventoryBudget;
  bodyStyle: InventoryBodyStyle;
  lifestyle: InventoryLifestyle;
  /** Active refinement chip within the selected life category. */
  lifeRefinement: string | null;
  storeId: string;
  sort: InventorySort;
}

export const DEFAULT_INVENTORY_SORT: InventorySort = "merchandised";

export const INVENTORY_PAGE_SIZE = 20;

export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {
  condition: "all",
  budget: "all",
  bodyStyle: "all",
  lifestyle: "all",
  lifeRefinement: null,
  storeId: "all",
  sort: DEFAULT_INVENTORY_SORT,
};

const LIFESTYLE_TO_INTENT: Partial<
  Record<Exclude<InventoryLifestyle, "all">, ShopperIntent>
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
  "first-vehicle": "first-vehicle",
  "fuel-efficient": "fuel-efficient",
  "weekend-ready": "weekend-ready",
  "everyday-drive": "everyday-drive",
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

export function toInventoryMatchFilters(
  filters: InventoryFilters,
): {
  matchFilters: InventoryMatchFilters;
  useLifeFilters: boolean;
} {
  const useLifeFilters =
    filters.lifestyle !== "all" && isLifeCategoryId(filters.lifestyle);
  return {
    useLifeFilters,
    matchFilters: {
      lifestyle: useLifeFilters
        ? "any"
        : INVENTORY_LIFESTYLE_TO_MATCH[filters.lifestyle],
      budget: INVENTORY_BUDGET_TO_MATCH[filters.budget],
      condition: INVENTORY_CONDITION_TO_MATCH[filters.condition],
      body_style: INVENTORY_BODY_TO_MATCH[filters.bodyStyle],
      store_id: filters.storeId !== "all" ? filters.storeId : undefined,
    },
  };
}

export function lifestyleToIntent(lifestyle: InventoryLifestyle): ShopperIntent {
  if (lifestyle === "all") return "any";
  return LIFESTYLE_TO_INTENT[lifestyle] ?? "any";
}

export function budgetToHomepageRange(
  budget: InventoryBudget,
): "any" | "under-30k" | "30-50k" | "50k-plus" {
  if (budget === "under-25k" || budget === "under-30k") return "under-30k";
  if (budget === "30-50k") return "30-50k";
  if (budget === "50k-plus") return "50k-plus";
  return "any";
}

export interface InventoryFilterMeta {
  /** True when Smart Match widened results — show a soft “similar picks” label. */
  similarPicks: boolean;
}

export function filterInventoryVehiclesWithMeta(
  vehicles: Vehicle[],
  filters: InventoryFilters,
  smartMatchCatalog?: SmartMatchRulesCatalog,
): { vehicles: Vehicle[]; meta: InventoryFilterMeta } {
  const catalog = smartMatchCatalog ?? FALLBACK_SMART_MATCH_CATALOG;
  const { matchFilters, useLifeFilters } = toInventoryMatchFilters(filters);

  const hasSmartMatchSelection =
    matchFilters.lifestyle !== "any" ||
    matchFilters.budget !== "any" ||
    matchFilters.condition !== "any" ||
    matchFilters.body_style !== "any";

  let result: Vehicle[];
  let similarPicks = false;
  if (hasSmartMatchSelection) {
    const smartMatch = getSmartMatchResults(vehicles, matchFilters, catalog);
    result = smartMatch.vehicles;
    similarPicks = smartMatch.fallbackUsed;
  } else {
    result = filterVehiclesByIntent(vehicles, matchFilters, catalog);
  }

  if (useLifeFilters) {
    const categoryId = filters.lifestyle as LifeCategoryId;
    const lifeFiltered = result.filter((vehicle) =>
      vehicleMatchesLifeCategory(vehicle, categoryId, catalog),
    );

    if (lifeFiltered.length > 0) {
      result = lifeFiltered;
    } else if (result.length === 0 && vehicles.length > 0) {
      const broadLife = vehicles.filter((vehicle) =>
        vehicleMatchesLifeCategory(vehicle, categoryId, catalog),
      );
      if (broadLife.length > 0) {
        result = broadLife;
      }
    }
    // When life category matches nothing but Smart Match already surfaced
    // fallback vehicles, keep `result` instead of replacing with [].

    if (filters.lifeRefinement) {
      const refined = result.filter((vehicle) =>
        vehicleMatchesLifeRefinement(
          vehicle,
          categoryId,
          filters.lifeRefinement!,
        ),
      );
      if (refined.length > 0) {
        result = refined;
      }
    }
  }

  return {
    vehicles: sortInventoryVehicles(result, filters.sort),
    meta: { similarPicks },
  };
}

export function filterInventoryVehicles(
  vehicles: Vehicle[],
  filters: InventoryFilters,
  smartMatchCatalog?: SmartMatchRulesCatalog,
): Vehicle[] {
  return filterInventoryVehiclesWithMeta(vehicles, filters, smartMatchCatalog)
    .vehicles;
}

/** Free-text inventory search from ?search= query param. */
export function filterVehiclesByKeywordSearch(
  vehicles: Vehicle[],
  query: string | null | undefined,
): Vehicle[] {
  const q = query?.trim().toLowerCase();
  if (!q) return vehicles;
  return vehicles.filter((vehicle) =>
    normalizeVehicle(vehicle).searchText.includes(q),
  );
}

export function readInventorySearchQuery(
  params: URLSearchParams,
): string | null {
  const value = params.get("search")?.trim();
  return value || null;
}

function imageCount(v: Vehicle): number {
  if (typeof v.image_count === "number") return v.image_count;
  if (Array.isArray(v.image_urls)) return v.image_urls.length;
  return v.primary_image_url ? 1 : 0;
}

function hasImages(v: Vehicle): boolean {
  if (typeof v.has_images === "boolean") return v.has_images;
  return imageCount(v) > 0;
}

function qualityScore(v: Vehicle): number {
  return typeof v.data_quality_score === "number" ? v.data_quality_score : 0;
}

function arrivalTimestamp(v: Vehicle): number {
  const raw = v.imported_at ?? v.created_at ?? null;
  if (!raw) return 0;
  const t = Date.parse(raw);
  return Number.isFinite(t) ? t : 0;
}

function compareNumberDesc(a: number, b: number): number {
  return b - a;
}

/** `null`/missing prices fall to the bottom on DESC NULLS LAST. */
function priceForDescNullsLast(v: Vehicle): number {
  return typeof v.internet_price === "number" ? v.internet_price : -Infinity;
}

/**
 * Client-side sort.
 *
 * The default `merchandised` order matches the admin merchandising
 * spec exactly: has_images DESC, image_count DESC, data_quality_score
 * DESC, internet_price DESC NULLS LAST. Customer-friendly sorts
 * (`value`, `newest`) keep imageless vehicles at the bottom.
 * `needs-attention` (admin only) is the only view that intentionally
 * surfaces low-quality rows first.
 */
export function sortInventoryVehicles(
  vehicles: Vehicle[],
  sort: InventorySort,
): Vehicle[] {
  const copy = [...vehicles];

  switch (sort) {
    case "merchandised":
    case "match":
      return sortVehiclesByMerchandisingQuality(copy);

    case "photos":
      return copy.sort((a, b) => {
        const countDiff = compareNumberDesc(imageCount(a), imageCount(b));
        if (countDiff !== 0) return countDiff;
        const scoreDiff = compareNumberDesc(qualityScore(a), qualityScore(b));
        if (scoreDiff !== 0) return scoreDiff;
        return priceForDescNullsLast(b) - priceForDescNullsLast(a);
      });

    case "needs-attention":
      return copy.sort((a, b) => {
        const imgDiff = Number(hasImages(a)) - Number(hasImages(b));
        if (imgDiff !== 0) return imgDiff;
        const scoreDiff = qualityScore(a) - qualityScore(b);
        if (scoreDiff !== 0) return scoreDiff;
        const countDiff = imageCount(a) - imageCount(b);
        if (countDiff !== 0) return countDiff;
        return (b.year ?? 0) - (a.year ?? 0);
      });

    case "newest-added":
      return copy.sort((a, b) => arrivalTimestamp(b) - arrivalTimestamp(a));

    case "value":
      return copy.sort((a, b) => {
        const imgDiff = Number(hasImages(b)) - Number(hasImages(a));
        if (imgDiff !== 0) return imgDiff;
        const priceA = a.internet_price ?? 1e9;
        const priceB = b.internet_price ?? 1e9;
        if (priceA !== priceB) return priceA - priceB;
        return (b.year ?? 0) - (a.year ?? 0);
      });

    case "newest":
      return copy.sort((a, b) => {
        const imgDiff = Number(hasImages(b)) - Number(hasImages(a));
        if (imgDiff !== 0) return imgDiff;
        return (b.year ?? 0) - (a.year ?? 0);
      });

    default:
      return copy;
  }
}

export function buildInventorySubtitle(
  filters: InventoryFilters,
  t?: Translator,
  locale: Locale = "en",
): string {
  if (filters.lifestyle !== "all" && isLifeCategoryId(filters.lifestyle)) {
    return getLifeResultMessaging(filters.lifestyle, locale).subtitle;
  }

  const parts: string[] = [];

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

export function getLifeCategoryHeader(
  filters: InventoryFilters,
  locale: Locale = "en",
): { title: string; subtitle: string } | null {
  if (filters.lifestyle === "all" || !isLifeCategoryId(filters.lifestyle)) {
    return null;
  }
  return getLifeResultMessaging(filters.lifestyle, locale);
}

export function getLifeEmptyStateCopy(
  filters: InventoryFilters,
  locale: Locale = "en",
): { title: string; body: string } | null {
  if (filters.lifestyle === "all" || !isLifeCategoryId(filters.lifestyle)) {
    return null;
  }
  return getLifeEmptyState(filters.lifestyle, locale);
}

export interface LifeRefinementChip {
  id: string;
  label: string;
  active: boolean;
  patch: Partial<InventoryFilters>;
}

export function getLifeRefinementChips(
  filters: InventoryFilters,
  locale: Locale = "en",
): LifeRefinementChip[] {
  if (filters.lifestyle === "all" || !isLifeCategoryId(filters.lifestyle)) {
    return [];
  }

  const config = getLifeCategory(filters.lifestyle);
  return config.refinements.map((refinement) => ({
    id: refinement.id,
    label: getLocalizedLifeRefinementLabel(refinement, locale),
    active: filters.lifeRefinement === refinement.id,
    patch: {
      lifeRefinement:
        filters.lifeRefinement === refinement.id ? null : refinement.id,
      ...(refinement.filterPatch ?? {}),
    },
  }));
}

export function getResultMatchLabel(
  filters: InventoryFilters,
  t?: Translator,
  locale: Locale = "en",
): string | null {
  if (filters.lifestyle === "all") return null;
  if (isLifeCategoryId(filters.lifestyle)) {
    return getLocalizedLifeCategory(getLifeCategory(filters.lifestyle), locale)
      .title;
  }
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
  if (filters.lifestyle !== "all" && isLifeCategoryId(filters.lifestyle)) {
    return [];
  }

  const suggestions: RefinementSuggestion[] = [];

  if (filters.bodyStyle !== "suv") {
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
    filters.lifeRefinement != null ||
    filters.storeId !== "all"
  );
}

/** Lifestyle / life-refinement filters need the full catalog for smart-match scoring. */
export function needsSmartMatchFiltering(filters: InventoryFilters): boolean {
  return filters.lifestyle !== "all" || filters.lifeRefinement != null;
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
  search?: string | null,
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.condition !== "all") params.set("condition", filters.condition);
  if (filters.budget !== "all") params.set("budget", filters.budget);
  if (filters.bodyStyle !== "all") params.set("body", filters.bodyStyle);
  if (filters.lifestyle !== "all") params.set("lifestyle", filters.lifestyle);
  if (filters.lifeRefinement) params.set("refine", filters.lifeRefinement);
  if (filters.storeId !== "all") params.set("store", filters.storeId);
  if (filters.sort !== DEFAULT_INVENTORY_SORT) params.set("sort", filters.sort);
  if (page && page > 1) params.set("page", String(page));
  const searchTrimmed = search?.trim();
  if (searchTrimmed) params.set("search", searchTrimmed);
  return params;
}

export function searchParamsToFilters(
  params: URLSearchParams,
): InventoryFilters {
  const condition = params.get("condition");
  const budget = params.get("budget");
  const body = params.get("body");
  const lifestyle = params.get("lifestyle");
  const refine = params.get("refine");
  const store = params.get("store");
  const sort = params.get("sort");

  return {
    condition: isCondition(condition) ? condition : "all",
    budget: isBudget(budget) ? budget : "all",
    bodyStyle: isBody(body) ? body : "all",
    lifestyle: isLifestyle(lifestyle) ? lifestyle : "all",
    lifeRefinement: refine,
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
    v === "fuel-efficient" ||
    v === "weekend-ready" ||
    v === "everyday-drive"
  );
}
/**
 * Customer-facing sort values exposed in the shopper UI. Admin
 * merchandising sorts (`photos`, `needs-attention`, `newest-added`)
 * are intentionally absent — they're back-office concepts and must
 * not appear in customer URLs or dropdowns.
 */
type CustomerInventorySort = Extract<
  InventorySort,
  "merchandised" | "value" | "newest" | "match"
>;

function isCustomerSort(v: string | null): v is CustomerInventorySort {
  return v === "merchandised" || v === "value" || v === "newest" || v === "match";
}

/**
 * Parse a sort value coming from a customer URL.
 *
 * Admin merchandising sorts collapse back to the silent default
 * (`merchandised`) so shoppers can't accidentally land on a
 * "Needs Attention" view by sharing or hand-editing a URL. Legacy
 * aliases continue to map for backward compatibility.
 */
function normalizeSort(v: string | null): InventorySort {
  if (v === "price-asc" || v === "price-desc") return "value";
  if (
    v === "photos" ||
    v === "most-photos" ||
    v === "needs-attention" ||
    v === "needs_attention" ||
    v === "newest-added" ||
    v === "newest_added" ||
    v === "added" ||
    v === "best-merchandised" ||
    v === "best_merchandised"
  ) {
    return "merchandised";
  }
  if (isCustomerSort(v)) return v;
  return DEFAULT_INVENTORY_SORT;
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
    "weekend-ready": "weekend-ready",
    "everyday-drive": "everyday-drive",
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
