import {
  filtersFromLifeCategory,
  type LifeCategoryId,
} from "./lifeFilters";
import type { Locale } from "./i18n/types";
import { FALLBACK_SMART_MATCH_CATALOG } from "./smartMatchRulesFallback";
import type {
  SmartMatchLifestyleKey,
  SmartMatchRule,
  SmartMatchRulesCatalog,
} from "./smartMatchRulesTypes";
import type {
  BudgetRange,
  ConditionFilter,
  ShopperIntent,
  Vehicle,
} from "./types";

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
    price: vehicle.internet_price,
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

/**
 * Vehicle matches a single DB/fallback rule.
 * Empty rule fields are ignored (forgiving). Non-empty fields are AND-ed.
 */
export function vehicleMatchesSmartMatchRule(
  vehicle: NormalizedVehicle,
  rule: SmartMatchRule,
): boolean {
  if (rule.bodyStyles.length > 0) {
    const ok = rule.bodyStyles.some(
      (style) =>
        vehicle.body_style.includes(style) ||
        vehicle.searchText.includes(style),
    );
    if (!ok) return false;
  }

  if (rule.makes.length > 0) {
    const ok = rule.makes.some(
      (make) =>
        vehicle.make.includes(make) || vehicle.searchText.includes(make),
    );
    if (!ok) return false;
  }

  if (rule.modelKeywords.length > 0) {
    const modelHaystack = `${vehicle.model} ${vehicle.searchText}`;
    if (!textMatchesAny(modelHaystack, rule.modelKeywords)) return false;
  }

  if (rule.trimKeywords.length > 0) {
    const trimHaystack = `${vehicle.trim} ${vehicle.searchText}`;
    if (!textMatchesAny(trimHaystack, rule.trimKeywords)) return false;
  }

  if (rule.minPrice != null && vehicle.price != null) {
    if (vehicle.price < rule.minPrice) return false;
  }

  if (rule.maxPrice != null && vehicle.price != null) {
    if (vehicle.price > rule.maxPrice) return false;
  }

  if (!matchesRuleCondition(vehicle, rule.condition)) return false;

  return true;
}

function getRulesForLifestyle(
  catalog: SmartMatchRulesCatalog,
  lifestyle: SmartMatchLifestyleKey,
): SmartMatchRule[] {
  return catalog[lifestyle] ?? [];
}

function vehicleMatchesLifestyle(
  vehicle: NormalizedVehicle,
  lifestyle: SmartMatchLifestyleKey,
  catalog: SmartMatchRulesCatalog,
): boolean {
  const rules = getRulesForLifestyle(catalog, lifestyle);
  if (rules.length === 0) return false;
  return rules.some((rule) => vehicleMatchesSmartMatchRule(vehicle, rule));
}

function getFirstMatchingRule(
  vehicle: NormalizedVehicle,
  lifestyle: SmartMatchLifestyleKey,
  catalog: SmartMatchRulesCatalog,
): SmartMatchRule | null {
  const rules = getRulesForLifestyle(catalog, lifestyle);
  return rules.find((rule) => vehicleMatchesSmartMatchRule(vehicle, rule)) ?? null;
}

function matchesBodyStyle(
  vehicle: NormalizedVehicle,
  body: MatchBodyStyle,
): boolean {
  if (body === "any") return true;
  const text = vehicle.searchText;
  const bodyStyle = vehicle.body_style;
  switch (body) {
    case "suv":
      return (
        text.includes("suv") ||
        text.includes("crossover") ||
        bodyStyle.includes("suv")
      );
    case "truck":
      return (
        text.includes("truck") ||
        text.includes("pickup") ||
        bodyStyle.includes("truck")
      );
    case "sedan":
      return text.includes("sedan") || bodyStyle.includes("sedan");
    case "coupe":
      return text.includes("coupe") || bodyStyle.includes("coupe");
    case "van":
      return (
        text.includes("van") ||
        text.includes("minivan") ||
        bodyStyle.includes("van")
      );
    default:
      return true;
  }
}

function matchesBudget(vehicle: NormalizedVehicle, budget: MatchBudget): boolean {
  if (budget === "any") return true;
  const price = vehicle.price;
  if (price === null || price <= 0) return false;
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

function matchesCondition(
  vehicle: NormalizedVehicle,
  condition: MatchCondition,
): boolean {
  if (condition === "any") return true;
  if (condition === "cpo") return vehicle.conditionNorm === "cpo";
  return vehicle.conditionNorm === condition;
}

/** Lifestyle predicate from Supabase rules (or merged fallback catalog). */
export function getLifestyleFilter(
  lifestyle: SmartMatchLifestyleKey,
  catalog: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): LifestylePredicate {
  return (vehicle) => vehicleMatchesLifestyle(vehicle, lifestyle, catalog);
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

/** Filter vehicles using shared lifestyle, budget, condition, body, and store rules. */
export function filterVehiclesByIntent(
  vehicles: Vehicle[],
  filters: InventoryMatchFilters,
  catalog: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): Vehicle[] {
  const { lifestyle, budget, condition, body_style, store_id } =
    activeFilters(filters);

  const impliedBody =
    lifestyle !== "any" ? LIFESTYLE_DEFAULT_BODY[lifestyle] : undefined;
  const bodyFilter = body_style !== "any" ? body_style : impliedBody ?? "any";

  return vehicles.filter((vehicle) => {
    const normalized = normalizeVehicle(vehicle);

    if (store_id && store_id !== "all" && normalized.store_id !== store_id) {
      return false;
    }
    if (
      lifestyle !== "any" &&
      !vehicleMatchesLifestyle(normalized, lifestyle, catalog)
    ) {
      return false;
    }
    if (!matchesBudget(normalized, budget)) return false;
    if (!matchesCondition(normalized, condition)) return false;
    if (!matchesBodyStyle(normalized, bodyFilter)) return false;

    return true;
  });
}

const URL_LIFESTYLE: Record<SmartMatchLifestyleKey, string> = {
  family: "family",
  work: "work",
  luxury: "luxury",
  budget: "budget",
  first: "first-vehicle",
  efficient: "fuel-efficient",
  weekend: "weekend-ready",
  everyday: "everyday-drive",
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
    if (matchedRule) {
      const label = ruleMatchLabel(matchedRule, locale);
      if (label) reasons.push(label);
    }
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
  "first-time": "first",
  "fuel-efficient": "efficient",
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
  "first-vehicle": "first",
  "fuel-efficient": "efficient",
  "weekend-ready": "weekend",
  "everyday-drive": "everyday",
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
  return filterVehiclesByIntent(
    vehicles,
    filtersFromShopByLife(choice),
    catalog,
  ).length;
}
