import {
  filtersFromLifeCategory,
  type LifeCategoryId,
} from "./lifeFilters";
import type { Locale } from "./i18n/types";
import { getEffectivePrice } from "./effectivePrice";
import { getLifestyleFriendlyLabel } from "./smartMatchLifestyle";
import { FALLBACK_SMART_MATCH_CATALOG } from "./smartMatchRulesFallback";
import type {
  SmartMatchLifestyleKey,
  SmartMatchRule,
  SmartMatchRuleMode,
  SmartMatchRulesCatalog,
} from "./smartMatchRulesTypes";
import {
  matchesShopperBodyStyleFilter,
  vehicleMatchesBodyStyleTokens,
} from "./bodyStyleMatch";
import { sortVehiclesByMerchandisingQuality } from "./vehicleQuality";
import type {
  BudgetRange,
  ConditionFilter,
  ShopperIntent,
  Vehicle,
} from "./types";

/**
 * Homepage discovery matching contract
 *
 * Shop by Life (broad):
 * - Lifestyle smart_match_rules only (OR across rules for that lifestyle)
 * - No budget / condition / body narrowing for counts
 *
 * Smart Match / Refine Your Fit (narrow):
 * - Applies filters in priority order: condition → budget → lifestyle rules
 * - Progressive fallback when zero matches but inventory exists (homepage only)
 *
 * Source of truth: Supabase `smart_match_rules` catalog from SmartMatchRulesProvider.
 * FALLBACK_SMART_MATCH_CATALOG only when Supabase returns zero active rules.
 */

const isDev = process.env.NODE_ENV === "development";

function logMatchDebug(
  event: string,
  payload: Record<string, unknown>,
): void {
  if (!isDev) return;
  console.log(`[inventoryMatch:${event}]`, payload);
}

function countCatalogRules(catalog: SmartMatchRulesCatalog): number {
  return (Object.values(catalog) as SmartMatchRule[][]).reduce(
    (sum, rules) => sum + rules.length,
    0,
  );
}

function isFallbackCatalog(catalog: SmartMatchRulesCatalog): boolean {
  const rules = (Object.values(catalog) as SmartMatchRule[][]).flat();
  return rules.length > 0 && rules.every((rule) => rule.id.startsWith("fallback-"));
}

/** Canonical lifestyle keys for matching (internal). */
export type MatchLifestyle =
  | "any"
  | SmartMatchLifestyleKey;

export type MatchBudget =
  | "any"
  | "under-25k"
  | "under-30k"
  | "under-40k"
  | "30-50k"
  | "50k-plus";

export type MatchCondition = "any" | "new" | "used" | "cpo";

export type MatchBodyStyle =
  | "any"
  | "suv"
  | "truck"
  | "sedan"
  | "coupe"
  | "van";

export interface InventoryMatchFilters {
  lifestyle?: MatchLifestyle;
  budget?: MatchBudget;
  condition?: MatchCondition;
  body_style?: MatchBodyStyle;
  store_id?: string;
}

export interface NormalizedVehicle {
  id: string;
  store_id: string | null;
  year: number | null;
  make: string;
  model: string;
  trim: string;
  body_style: string;
  condition: string;
  conditionNorm: "new" | "used" | "cpo" | "other";
  price: number | null;
  mileage: number | null;
  stock_number: string;
  primary_image_url: string | null;
  searchText: string;
  tags: string[];
  description: string;
  raw: Vehicle;
}

const LIFESTYLE_DEFAULT_BODY: Partial<
  Record<SmartMatchLifestyleKey, MatchBodyStyle>
> = {
  family: "suv",
  work: "truck",
};

type LifestylePredicate = (vehicle: NormalizedVehicle) => boolean;

function asRecord(vehicle: Vehicle): Record<string, unknown> {
  return vehicle as unknown as Record<string, unknown>;
}

function readString(
  record: Record<string, unknown>,
  key: string,
): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

function readTags(record: Record<string, unknown>): string[] {
  const tags = record.tags ?? record.features;
  if (!Array.isArray(tags)) return [];
  return tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeCondition(
  condition: string,
): NormalizedVehicle["conditionNorm"] {
  const c = condition.toLowerCase();
  if (c === "new") return "new";
  if (c === "used") return "used";
  if (c === "cpo" || c.includes("cert")) return "cpo";
  return "other";
}

/** Flatten vehicle fields into a consistent shape for matching. */
export function normalizeVehicle(vehicle: Vehicle): NormalizedVehicle {
  const record = asRecord(vehicle);
  const make = (vehicle.make ?? "").trim();
  const model = (vehicle.model ?? "").trim();
  const trim = (vehicle.trim ?? "").trim();
  const body_style = (vehicle.body_style ?? "").trim();
  const condition = (vehicle.condition ?? "").trim();
  const tags = readTags(record);
  const description =
    readString(record, "description") ||
    readString(record, "comments") ||
    readString(record, "features_text");

  const searchText = [
    make,
    model,
    trim,
    body_style,
    condition,
    description,
    tags.join(" "),
    vehicle.stock_number ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    id: vehicle.id,
    store_id: vehicle.store_id ?? null,
    year: vehicle.year,
    make: make.toLowerCase(),
    model: model.toLowerCase(),
    trim: trim.toLowerCase(),
    body_style: body_style.toLowerCase(),
    condition,
    conditionNorm: normalizeCondition(condition),
    price: getEffectivePrice(vehicle),
    mileage:
      typeof record.mileage === "number" && Number.isFinite(record.mileage)
        ? record.mileage
        : null,
    stock_number: (vehicle.stock_number ?? "").trim(),
    primary_image_url: vehicle.primary_image_url,
    searchText,
    tags,
    description: description.toLowerCase(),
    raw: vehicle,
  };
}

function textMatchesAny(haystack: string, needles: string[]): boolean {
  if (needles.length === 0) return true;
  return needles.some((needle) => {
    const q = needle.trim().toLowerCase();
    return q.length > 0 && haystack.includes(q);
  });
}

function matchesRuleCondition(
  vehicle: NormalizedVehicle,
  condition: SmartMatchRule["condition"],
): boolean {
  if (!condition) return true;
  if (condition === "cpo") return vehicle.conditionNorm === "cpo";
  return vehicle.conditionNorm === condition;
}

function applyRuleMode(
  rule: SmartMatchRule,
  mode: SmartMatchRuleMode,
): SmartMatchRule {
  switch (mode) {
    case "strict":
      return rule;
    case "noCondition":
      return { ...rule, condition: null };
    case "noPriceNoCondition":
      return { ...rule, condition: null, minPrice: null, maxPrice: null };
    case "identityOnly":
      return {
        ...rule,
        condition: null,
        minPrice: null,
        maxPrice: null,
        trimKeywords: [],
      };
    default:
      return rule;
  }
}

/**
 * Vehicle matches a Supabase smart_match_rules row.
 * Empty rule fields are ignored. Price uses effective price (internet → msrp).
 */
export function vehicleMatchesSmartMatchRule(
  vehicle: NormalizedVehicle,
  rule: SmartMatchRule,
  mode: SmartMatchRuleMode = "strict",
): boolean {
  const activeRule = applyRuleMode(rule, mode);

  if (
    activeRule.bodyStyles.length > 0 &&
    !vehicleMatchesBodyStyleTokens(
      vehicle.body_style,
      vehicle.searchText,
      activeRule.bodyStyles,
    )
  ) {
    return false;
  }

  const identityChecks: Array<{ active: boolean; ok: boolean }> = [
    {
      active: activeRule.makes.length > 0,
      ok: activeRule.makes.some(
        (make) =>
          vehicle.make.includes(make) || vehicle.searchText.includes(make),
      ),
    },
    {
      active: activeRule.modelKeywords.length > 0,
      ok: textMatchesAny(
        `${vehicle.model} ${vehicle.searchText}`,
        activeRule.modelKeywords,
      ),
    },
    {
      active: activeRule.trimKeywords.length > 0,
      ok: textMatchesAny(
        `${vehicle.trim} ${vehicle.searchText}`,
        activeRule.trimKeywords,
      ),
    },
  ];
  const activeIdentity = identityChecks.filter((check) => check.active);
  if (activeIdentity.length > 0 && !activeIdentity.some((check) => check.ok)) {
    return false;
  }

  if (activeRule.minPrice != null && vehicle.price != null) {
    if (vehicle.price < activeRule.minPrice) return false;
  }

  if (activeRule.maxPrice != null && vehicle.price != null) {
    if (vehicle.price > activeRule.maxPrice) return false;
  }

  if (!matchesRuleCondition(vehicle, activeRule.condition)) return false;

  return true;
}

function getRulesForLifestyle(
  catalog: SmartMatchRulesCatalog,
  lifestyle: SmartMatchLifestyleKey,
): SmartMatchRule[] {
  return catalog[lifestyle] ?? [];
}

/** Active rules catalog (Supabase-backed or full fallback when DB has zero rules). */
export function getActiveSmartMatchRules(
  rules: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): SmartMatchRulesCatalog {
  const activeRulesCount = countCatalogRules(rules);
  logMatchDebug("activeRules", {
    activeRulesCount,
    fallbackCatalog: isFallbackCatalog(rules),
  });
  return rules;
}

export function getRuleForLifestyle(
  lifestyle: SmartMatchLifestyleKey,
  rules: SmartMatchRulesCatalog,
): SmartMatchRule[] {
  return getRulesForLifestyle(getActiveSmartMatchRules(rules), lifestyle);
}

/** Vehicle matches a single lifestyle rule (case-insensitive; empty rule fields ignored). */
export function vehicleMatchesLifestyle(
  vehicle: Vehicle | NormalizedVehicle,
  rule: SmartMatchRule,
): boolean {
  const normalized =
    "searchText" in vehicle ? vehicle : normalizeVehicle(vehicle);
  return vehicleMatchesSmartMatchRule(normalized, rule);
}

export function vehicleMatchesLifestyleKey(
  vehicle: NormalizedVehicle,
  lifestyle: SmartMatchLifestyleKey,
  catalog: SmartMatchRulesCatalog,
  mode: SmartMatchRuleMode = "strict",
): boolean {
  const lifestyleRules = getRuleForLifestyle(lifestyle, catalog);
  if (lifestyleRules.length === 0) return false;
  return lifestyleRules.some((rule) =>
    vehicleMatchesSmartMatchRule(vehicle, rule, mode),
  );
}

function filterVehiclesByLifestyleRules(
  vehicles: Vehicle[],
  lifestyle: SmartMatchLifestyleKey,
  catalog: SmartMatchRulesCatalog,
  mode: SmartMatchRuleMode,
  storeId?: string,
): Vehicle[] {
  const matched = vehicles.filter((vehicle) => {
    const normalized = normalizeVehicle(vehicle);
    if (storeId && storeId !== "all" && normalized.store_id !== storeId) {
      return false;
    }
    return vehicleMatchesLifestyleKey(normalized, lifestyle, catalog, mode);
  });
  return sortVehiclesByMerchandisingQuality(matched);
}

function filterVehiclesByStore(
  vehicles: Vehicle[],
  storeId: string | undefined,
): Vehicle[] {
  if (!storeId || storeId === "all") return vehicles;
  return vehicles.filter((vehicle) => {
    const normalized = normalizeVehicle(vehicle);
    return normalized.store_id === storeId;
  });
}

function getFirstMatchingRule(
  vehicle: NormalizedVehicle,
  lifestyle: SmartMatchLifestyleKey,
  catalog: SmartMatchRulesCatalog,
): SmartMatchRule | null {
  const rules = getRuleForLifestyle(lifestyle, catalog);
  return rules.find((rule) => vehicleMatchesLifestyle(vehicle, rule)) ?? null;
}

function matchesBodyStyle(
  vehicle: NormalizedVehicle,
  body: MatchBodyStyle,
): boolean {
  return matchesShopperBodyStyleFilter(
    vehicle.body_style,
    vehicle.searchText,
    body,
  );
}

function matchesBudget(vehicle: NormalizedVehicle, budget: MatchBudget): boolean {
  return vehicleMatchesBudget(vehicle, budget);
}

function matchesCondition(
  vehicle: NormalizedVehicle,
  condition: MatchCondition,
): boolean {
  return vehicleMatchesCondition(vehicle, condition);
}

/** Budget filter — missing effective price does not disqualify (forgiving). */
export function vehicleMatchesBudget(
  vehicle: Vehicle | NormalizedVehicle,
  budget: MatchBudget,
): boolean {
  if (budget === "any") return true;
  const normalized =
    "searchText" in vehicle ? vehicle : normalizeVehicle(vehicle);
  const price = normalized.price;
  if (price === null || price <= 0) return true;
  switch (budget) {
    case "under-25k":
      return price < 25000;
    case "under-30k":
      return price < 30000;
    case "under-40k":
      return price < 40000;
    case "30-50k":
      return price >= 30000 && price <= 50000;
    case "50k-plus":
      return price > 50000;
    default:
      return true;
  }
}

/** Condition filter — unknown condition does not disqualify (forgiving). */
export function vehicleMatchesCondition(
  vehicle: Vehicle | NormalizedVehicle,
  condition: MatchCondition,
): boolean {
  if (condition === "any") return true;
  const normalized =
    "searchText" in vehicle ? vehicle : normalizeVehicle(vehicle);
  if (normalized.conditionNorm === "other") return true;
  if (condition === "cpo") return normalized.conditionNorm === "cpo";
  return normalized.conditionNorm === condition;
}

/** Lifestyle predicate from Supabase rules (or fallback when DB has zero rules). */
export function getLifestyleFilter(
  lifestyle: SmartMatchLifestyleKey,
  catalog: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): LifestylePredicate {
  const activeRules = getActiveSmartMatchRules(catalog);
  return (vehicle) => vehicleMatchesLifestyleKey(vehicle, lifestyle, activeRules);
}

function activeFilters(filters: InventoryMatchFilters): Required<
  Pick<InventoryMatchFilters, "lifestyle" | "budget" | "condition" | "body_style">
> & { store_id: string | undefined } {
  return {
    lifestyle: filters.lifestyle ?? "any",
    budget: filters.budget ?? "any",
    condition: filters.condition ?? "any",
    body_style: filters.body_style ?? "any",
    store_id: filters.store_id,
  };
}

function vehicleMatchesSmartMatchFilters(
  normalized: NormalizedVehicle,
  filters: InventoryMatchFilters,
  catalog: SmartMatchRulesCatalog,
): boolean {
  const { lifestyle, budget, condition, body_style } = activeFilters(filters);

  // Priority: condition → budget → lifestyle rules → optional explicit body
  if (condition !== "any" && !vehicleMatchesCondition(normalized, condition)) {
    return false;
  }
  if (budget !== "any" && !vehicleMatchesBudget(normalized, budget)) {
    return false;
  }
  if (
    lifestyle !== "any" &&
    !vehicleMatchesLifestyleKey(normalized, lifestyle, catalog)
  ) {
    return false;
  }
  if (body_style !== "any" && !matchesBodyStyle(normalized, body_style)) {
    return false;
  }

  return true;
}

/** Filter vehicles using shared lifestyle, budget, condition, and store rules. */
export function filterVehiclesByIntent(
  vehicles: Vehicle[],
  filters: InventoryMatchFilters,
  catalog: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): Vehicle[] {
  const activeRules = getActiveSmartMatchRules(catalog);
  const { lifestyle, budget, condition, store_id } = activeFilters(filters);

  logMatchDebug("filter", {
    activeRulesCount: countCatalogRules(activeRules),
    selectedLifestyle: lifestyle,
    selectedBudget: budget,
    selectedCondition: condition,
  });

  const matched = vehicles.filter((vehicle) => {
    const normalized = normalizeVehicle(vehicle);

    if (store_id && store_id !== "all" && normalized.store_id !== store_id) {
      return false;
    }

    return vehicleMatchesSmartMatchFilters(normalized, filters, activeRules);
  });

  logMatchDebug("filterResult", {
    matchedVehicleCount: matched.length,
  });

  return sortVehiclesByMerchandisingQuality(matched);
}

const URL_LIFESTYLE: Record<SmartMatchLifestyleKey, string> = {
  family: "family",
  work: "work",
  luxury: "luxury",
  budget: "budget",
  "first-vehicle": "first-vehicle",
  "fuel-efficient": "fuel-efficient",
  "weekend-ready": "weekend-ready",
  "everyday-drive": "everyday-drive",
};

/** Build /inventory URL query from match filters (inventory page compatible). */
export function buildInventoryUrl(filters: InventoryMatchFilters): string {
  const params = new URLSearchParams();
  const lifestyle = filters.lifestyle ?? "any";
  const budget = filters.budget ?? "any";
  const condition = filters.condition ?? "any";
  const body = filters.body_style ?? "any";

  if (lifestyle !== "any") {
    params.set("lifestyle", URL_LIFESTYLE[lifestyle]);
  }
  if (budget !== "any") {
    params.set("budget", budget);
  }
  if (condition !== "any") {
    params.set("condition", condition);
  }
  if (body !== "any") {
    params.set("body", body);
  }
  if (filters.store_id && filters.store_id !== "all") {
    params.set("store", filters.store_id);
  }

  const query = params.toString();
  return query ? `/inventory?${query}` : "/inventory";
}

type MatchReasonKey =
  | "budgetCap"
  | "conditionNew"
  | "conditionUsed"
  | "conditionCpo"
  | "bodySuv"
  | "bodyTruck";

const MATCH_REASONS: Record<Locale, Record<MatchReasonKey, string>> = {
  en: {
    budgetCap: "Within your selected payment range",
    conditionNew: "New inventory match",
    conditionUsed: "Pre-owned match",
    conditionCpo: "Certified pre-owned match",
    bodySuv: "SUV body style match",
    bodyTruck: "Truck body style match",
  },
  es: {
    budgetCap: "Dentro del rango de pago que elegiste",
    conditionNew: "Coincide con inventario nuevo",
    conditionUsed: "Coincide con seminuevo",
    conditionCpo: "Coincide con certificado pre-owned",
    bodySuv: "Coincide con estilo SUV",
    bodyTruck: "Coincide con estilo camioneta",
  },
};

function reason(locale: Locale, key: MatchReasonKey): string {
  return MATCH_REASONS[locale][key];
}

function ruleMatchLabel(rule: SmartMatchRule, locale: Locale): string | null {
  const en = rule.labelEn?.trim();
  const es = rule.labelEs?.trim();
  if (locale === "es") {
    return es || en || null;
  }
  return en || es || null;
}

/** Short explanation of why a vehicle matched the active filters. */
export function getMatchReason(
  vehicle: Vehicle,
  filters: InventoryMatchFilters,
  locale: Locale = "en",
  catalog: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): string | null {
  const normalized = normalizeVehicle(vehicle);
  const { lifestyle, budget, condition, body_style } = activeFilters(filters);
  const reasons: string[] = [];

  if (lifestyle !== "any") {
    const matchedRule = getFirstMatchingRule(
      normalized,
      lifestyle,
      catalog,
    );
  const friendly = getLifestyleFriendlyLabel(lifestyle, locale);
  reasons.push(
    matchedRule
      ? ruleMatchLabel(matchedRule, locale) ?? friendly
      : friendly,
  );
  }

  if (budget !== "any" && matchesBudget(normalized, budget)) {
    reasons.push(reason(locale, "budgetCap"));
  }

  if (condition === "new" && matchesCondition(normalized, "new")) {
    reasons.push(reason(locale, "conditionNew"));
  } else if (condition === "used" && matchesCondition(normalized, "used")) {
    reasons.push(reason(locale, "conditionUsed"));
  } else if (condition === "cpo" && matchesCondition(normalized, "cpo")) {
    reasons.push(reason(locale, "conditionCpo"));
  }

  if (body_style === "suv" && matchesBodyStyle(normalized, "suv")) {
    reasons.push(reason(locale, "bodySuv"));
  } else if (body_style === "truck" && matchesBodyStyle(normalized, "truck")) {
    reasons.push(reason(locale, "bodyTruck"));
  }

  if (reasons.length === 0) return null;
  return reasons.slice(0, 2).join(" · ");
}

// —— Adapters (homepage / legacy types) ——

const SHOPPER_TO_LIFESTYLE: Record<
  Exclude<ShopperIntent, "any">,
  SmartMatchLifestyleKey
> = {
  "family-suv": "family",
  "work-truck": "work",
  luxury: "luxury",
  "under-30k": "budget",
  "first-time": "first-vehicle",
  "fuel-efficient": "fuel-efficient",
};

const HOMEPAGE_BUDGET_TO_MATCH: Record<BudgetRange, MatchBudget> = {
  any: "any",
  "under-30k": "under-30k",
  "30-50k": "30-50k",
  "50k-plus": "50k-plus",
};

const HOMEPAGE_CONDITION_TO_MATCH: Record<ConditionFilter, MatchCondition> = {
  either: "any",
  new: "new",
  used: "used",
};

/** Map Smart Match shopper intent + steps to shared match filters. */
export function filtersFromShopperSelection(
  intent: ShopperIntent,
  budget: BudgetRange,
  condition: ConditionFilter,
): InventoryMatchFilters {
  return {
    lifestyle: intent === "any" ? "any" : SHOPPER_TO_LIFESTYLE[intent],
    budget: HOMEPAGE_BUDGET_TO_MATCH[budget],
    condition: HOMEPAGE_CONDITION_TO_MATCH[condition],
    body_style:
      intent === "family-suv"
        ? "suv"
        : intent === "work-truck"
          ? "truck"
          : "any",
  };
}

export type ShopByLifeChoice =
  | "family"
  | "work"
  | "luxury"
  | "budget"
  | "first-vehicle"
  | "fuel-efficient"
  | "weekend-ready"
  | "everyday-drive";

const SHOP_BY_LIFE_TO_LIFESTYLE: Record<
  ShopByLifeChoice,
  SmartMatchLifestyleKey
> = {
  family: "family",
  work: "work",
  luxury: "luxury",
  budget: "budget",
  "first-vehicle": "first-vehicle",
  "fuel-efficient": "fuel-efficient",
  "weekend-ready": "weekend-ready",
  "everyday-drive": "everyday-drive",
};

export function filtersFromShopByLife(
  choice: ShopByLifeChoice,
): InventoryMatchFilters {
  const lifePatch = filtersFromLifeCategory(choice as LifeCategoryId);
  const lifestyle = SHOP_BY_LIFE_TO_LIFESTYLE[choice];
  return {
    lifestyle,
    budget:
      lifePatch.budget && lifePatch.budget !== "all"
        ? lifePatch.budget
        : "any",
    condition:
      lifePatch.condition && lifePatch.condition !== "all"
        ? lifePatch.condition
        : "any",
    body_style:
      lifePatch.bodyStyle && lifePatch.bodyStyle !== "all"
        ? lifePatch.bodyStyle
        : LIFESTYLE_DEFAULT_BODY[lifestyle] ?? "any",
  };
}

export function countVehiclesForShopByLife(
  vehicles: Vehicle[],
  choice: ShopByLifeChoice,
  catalog: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): number {
  return getShopByLifeCount(vehicles, choice, catalog);
}

/** Shop by Life count — lifestyle smart_match_rules only (broad, forgiving). */
export function getShopByLifeCount(
  vehicles: Vehicle[],
  choice: ShopByLifeChoice,
  rules: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): number {
  const lifestyle = SHOP_BY_LIFE_TO_LIFESTYLE[choice];
  const activeRules = getActiveSmartMatchRules(rules);

  logMatchDebug("shopByLife", {
    activeRulesCount: countCatalogRules(activeRules),
    selectedLifestyle: lifestyle,
    selectedBudget: "any",
    selectedCondition: "any",
  });

  const matched = vehicles.filter((vehicle) => {
    const normalized = normalizeVehicle(vehicle);
    return vehicleMatchesLifestyleKey(normalized, lifestyle, activeRules);
  });

  logMatchDebug("shopByLifeResult", {
    matchedVehicleCount: matched.length,
    fallbackUsed: false,
  });

  return matched.length;
}

export interface SmartMatchResults {
  vehicles: Vehicle[];
  fallbackUsed: boolean;
  matchedCount: number;
}

/**
 * Smart Match results with progressive fallback when strict matching returns zero
 * but active inventory exists (homepage Refine Your Fit + inventory SRP).
 *
 * Fallback order (each step runs only after the prior step returned zero):
 * 1. strict filters + strict rules
 * 2. drop shopper condition filter
 * 3. drop shopper budget filter
 * 4. lifestyle rules — make, model keywords, body style only (partial body match)
 * 5. all active inventory (merchandising sort: has_images → image_count → data_quality_score)
 */
export function getSmartMatchResults(
  vehicles: Vehicle[],
  filters: InventoryMatchFilters,
  rules: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): SmartMatchResults {
  const activeRules = getActiveSmartMatchRules(rules);
  const { lifestyle, budget, condition, store_id } = activeFilters(filters);

  logMatchDebug("smartMatch", {
    activeRulesCount: countCatalogRules(activeRules),
    selectedLifestyle: lifestyle,
    selectedBudget: budget,
    selectedCondition: condition,
  });

  if (vehicles.length === 0) {
    logMatchDebug("smartMatchResult", {
      matchedVehicleCount: 0,
      fallbackUsed: false,
      fallbackStep: "emptyInventory",
    });
    return {
      vehicles: [],
      fallbackUsed: false,
      matchedCount: 0,
    };
  }

  const strict = filterVehiclesByIntent(vehicles, filters, activeRules);
  if (strict.length > 0) {
    logMatchDebug("smartMatchResult", {
      matchedVehicleCount: strict.length,
      fallbackUsed: false,
      fallbackStep: "strict",
    });
    return {
      vehicles: strict,
      fallbackUsed: false,
      matchedCount: strict.length,
    };
  }

  const withoutCondition = filterVehiclesByIntent(
    vehicles,
    { ...filters, condition: "any" },
    activeRules,
  );
  if (withoutCondition.length > 0) {
    logMatchDebug("smartMatchResult", {
      matchedVehicleCount: withoutCondition.length,
      fallbackUsed: true,
      fallbackStep: "dropFilterCondition",
    });
    return {
      vehicles: withoutCondition,
      fallbackUsed: true,
      matchedCount: withoutCondition.length,
    };
  }

  const withoutBudget = filterVehiclesByIntent(
    vehicles,
    { ...filters, budget: "any", condition: "any" },
    activeRules,
  );
  if (withoutBudget.length > 0) {
    logMatchDebug("smartMatchResult", {
      matchedVehicleCount: withoutBudget.length,
      fallbackUsed: true,
      fallbackStep: "dropFilterBudget",
    });
    return {
      vehicles: withoutBudget,
      fallbackUsed: true,
      matchedCount: withoutBudget.length,
    };
  }

  if (lifestyle !== "any") {
    const identityOnly = filterVehiclesByLifestyleRules(
      vehicles,
      lifestyle,
      activeRules,
      "identityOnly",
      store_id,
    );
    if (identityOnly.length > 0) {
      logMatchDebug("smartMatchResult", {
        matchedVehicleCount: identityOnly.length,
        fallbackUsed: true,
        fallbackStep: "identityOnly",
      });
      return {
        vehicles: identityOnly,
        fallbackUsed: true,
        matchedCount: identityOnly.length,
      };
    }
  }

  const allInventory = sortVehiclesByMerchandisingQuality(
    filterVehiclesByStore(vehicles, store_id),
  );

  logMatchDebug("smartMatchResult", {
    matchedVehicleCount: allInventory.length,
    fallbackUsed: true,
    fallbackStep: "merchandisedInventory",
  });

  return {
    vehicles: allInventory,
    fallbackUsed: true,
    matchedCount: allInventory.length,
  };
}

export { getLifestyleFriendlyLabel } from "./smartMatchLifestyle";

/** Alias for buildInventoryUrl — shared discovery → inventory deep link. */
export const buildInventoryUrlFromMatch = buildInventoryUrl;
