import { resolveBodyStyleCategories } from "./bodyStyleMatch";
import { getEffectivePrice } from "./effectivePrice";
import type { Locale } from "./i18n/types";
import {
  normalizeVehicle,
  vehicleMatchesLifestyleKey,
  type InventoryMatchFilters,
  type MatchLifestyle,
} from "./inventoryMatch";
import { isLifeCategoryId, type LifeCategoryId } from "./lifeFilters";
import type { InventoryFilters } from "./inventorySearch";
import { lifestyleToIntent, toInventoryMatchFilters } from "./inventorySearch";
import { FALLBACK_SMART_MATCH_CATALOG } from "./smartMatchRulesFallback";
import type { SmartMatchRulesCatalog } from "./smartMatchRulesTypes";
import type { ShopperIntent, Vehicle } from "./types";

/** Minimum listing-quality score (internal) before surfacing a highlight badge. */
const STRONG_LISTING_SCORE = 75;

export type VehicleHighlightBadge = "top-match" | "recommended";

export interface VehicleMatchPresentation {
  /** Up to 3 friendly chips; UI should show at most 2. */
  chips: string[];
  badge: VehicleHighlightBadge | null;
}

type ChipKey =
  | "familyFriendly"
  | "roomySuv"
  | "workTruck"
  | "strongValue"
  | "fuelConscious"
  | "premiumTrim"
  | "weekendReady"
  | "easyDaily"
  | "luxuryFeel"
  | "certifiedConfidence"
  | "freshOnLot"
  | "smartSavings"
  | "capableHauler"
  | "comfortableCabin";

const CHIP_COPY: Record<ChipKey, Record<Locale, string>> = {
  familyFriendly: { en: "Great for families", es: "Ideal para familias" },
  roomySuv: { en: "Roomy SUV", es: "SUV espaciosa" },
  workTruck: { en: "Work-ready truck", es: "Camioneta para trabajo" },
  strongValue: { en: "Strong value", es: "Excelente valor" },
  fuelConscious: { en: "Fuel-conscious pick", es: "Opción eficiente" },
  premiumTrim: { en: "Premium trim", es: "Versión premium" },
  weekendReady: { en: "Weekend-ready", es: "Listo para el fin de semana" },
  easyDaily: { en: "Easy daily driver", es: "Ideal para el día a día" },
  luxuryFeel: { en: "Elevated comfort", es: "Confort elevado" },
  certifiedConfidence: {
    en: "Certified confidence",
    es: "Certificado con confianza",
  },
  freshOnLot: { en: "Fresh on the lot", es: "Recién llegado" },
  smartSavings: { en: "Smart savings", es: "Ahorro inteligente" },
  capableHauler: { en: "Capable hauler", es: "Gran capacidad de carga" },
  comfortableCabin: { en: "Comfortable cabin", es: "Cabina cómoda" },
};

const BADGE_COPY: Record<VehicleHighlightBadge, Record<Locale, string>> = {
  "top-match": { en: "Top Match", es: "Mejor opción" },
  recommended: { en: "Recommended", es: "Recomendado" },
};

const SHOPPER_TO_LIFESTYLE: Partial<
  Record<Exclude<ShopperIntent, "any">, MatchLifestyle>
> = {
  "family-suv": "family",
  "work-truck": "work",
  luxury: "luxury",
  "under-30k": "budget",
  "first-time": "first-vehicle",
  "fuel-efficient": "fuel-efficient",
};

const LIFESTYLE_CHIP: Partial<Record<MatchLifestyle, ChipKey>> = {
  family: "familyFriendly",
  work: "workTruck",
  luxury: "luxuryFeel",
  budget: "strongValue",
  "first-vehicle": "easyDaily",
  "fuel-efficient": "fuelConscious",
  "weekend-ready": "weekendReady",
  "everyday-drive": "easyDaily",
};

const LIFE_CATEGORY_CHIP: Partial<Record<LifeCategoryId, ChipKey>> = {
  family: "familyFriendly",
  work: "workTruck",
  luxury: "luxuryFeel",
  budget: "strongValue",
  "first-vehicle": "easyDaily",
  "fuel-efficient": "fuelConscious",
  "weekend-ready": "weekendReady",
  "everyday-drive": "easyDaily",
};

function chip(key: ChipKey, locale: Locale): string {
  return CHIP_COPY[key][locale] ?? CHIP_COPY[key].en;
}

export function getHighlightBadgeLabel(
  badge: VehicleHighlightBadge,
  locale: Locale = "en",
): string {
  return BADGE_COPY[badge][locale] ?? BADGE_COPY[badge].en;
}

export function getSimilarPicksHeading(locale: Locale = "en"): string {
  return locale === "es"
    ? "Opciones similares que te pueden gustar"
    : "Similar picks you may like";
}

function vehicleHasPhotos(vehicle: Vehicle): boolean {
  if (typeof vehicle.has_images === "boolean") return vehicle.has_images;
  if (Array.isArray(vehicle.image_urls) && vehicle.image_urls.length > 0) {
    return true;
  }
  return Boolean(vehicle.primary_image_url);
}

function vehicleListingQualityStrong(vehicle: Vehicle): boolean {
  const score = vehicle.data_quality_score;
  return typeof score === "number" && score >= STRONG_LISTING_SCORE;
}

function vehicleStrictLifestyleMatch(
  vehicle: Vehicle,
  lifestyle: MatchLifestyle,
  catalog: SmartMatchRulesCatalog,
): boolean {
  if (lifestyle === "any") return false;
  const normalized = normalizeVehicle(vehicle);
  return vehicleMatchesLifestyleKey(normalized, lifestyle, catalog, "strict");
}

function resolveLifestyle(
  options: MatchReasonOptions,
): MatchLifestyle | "any" {
  if (options.lifestyle && options.lifestyle !== "any") {
    return options.lifestyle;
  }
  if (options.shopperIntent && options.shopperIntent !== "any") {
    const fromIntent = SHOPPER_TO_LIFESTYLE[options.shopperIntent];
    if (fromIntent) return fromIntent;
  }
  if (
    options.inventoryFilters?.lifestyle &&
    options.inventoryFilters.lifestyle !== "all" &&
    !isLifeCategoryId(options.inventoryFilters.lifestyle)
  ) {
    const intent = lifestyleToIntent(options.inventoryFilters.lifestyle);
    if (intent !== "any") {
      const mapped = SHOPPER_TO_LIFESTYLE[intent];
      if (mapped) return mapped;
    }
  }
  return "any";
}

function appendChip(
  list: string[],
  seen: Set<string>,
  label: string,
  max = 3,
): void {
  if (list.length >= max || !label || seen.has(label)) return;
  seen.add(label);
  list.push(label);
}

function chipsFromBodyStyle(
  vehicle: Vehicle,
  locale: Locale,
  seen: Set<string>,
  list: string[],
): void {
  const categories = resolveBodyStyleCategories(
    vehicle.body_style ?? "",
    [vehicle.model, vehicle.trim, vehicle.make].filter(Boolean).join(" "),
  );
  if (categories.has("suv")) appendChip(list, seen, chip("roomySuv", locale));
  if (categories.has("truck")) appendChip(list, seen, chip("workTruck", locale));
  if (categories.has("van")) {
    appendChip(list, seen, chip("comfortableCabin", locale));
  }
  if (categories.has("sedan") || categories.has("hatch")) {
    appendChip(list, seen, chip("easyDaily", locale));
  }
  if (categories.has("coupe") || categories.has("convertible")) {
    appendChip(list, seen, chip("weekendReady", locale));
  }
}

function chipsFromVehicleSignals(
  vehicle: Vehicle,
  locale: Locale,
  seen: Set<string>,
  list: string[],
): void {
  const condition = (vehicle.condition ?? "").toLowerCase();
  if (condition.includes("cert") || condition === "cpo") {
    appendChip(list, seen, chip("certifiedConfidence", locale));
  } else if (condition === "new") {
    appendChip(list, seen, chip("freshOnLot", locale));
  }

  const trim = (vehicle.trim ?? "").toLowerCase();
  if (
    /premium|luxury|platinum|limited|prestige|elite|signature/.test(trim)
  ) {
    appendChip(list, seen, chip("premiumTrim", locale));
  }

  const price = getEffectivePrice(vehicle);
  const msrp =
    typeof vehicle.msrp === "number" && vehicle.msrp > 0
      ? vehicle.msrp
      : null;
  if (price != null && msrp != null && msrp > price + 500) {
    appendChip(list, seen, chip("smartSavings", locale));
  } else if (price != null && price < 30000) {
    appendChip(list, seen, chip("strongValue", locale));
  }

  const haystack = [vehicle.model, vehicle.trim, vehicle.body_style]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/hybrid|mpg|efficient|eco|ev|electric/.test(haystack)) {
    appendChip(list, seen, chip("fuelConscious", locale));
  }
  if (/tow|payload|4x4|4wd|crew cab/.test(haystack)) {
    appendChip(list, seen, chip("capableHauler", locale));
  }
}

export interface MatchReasonOptions {
  locale?: Locale;
  lifestyle?: MatchLifestyle;
  shopperIntent?: ShopperIntent;
  inventoryFilters?: InventoryFilters;
  matchFilters?: InventoryMatchFilters;
  catalog?: SmartMatchRulesCatalog;
}

export function getVehicleMatchPresentation(
  vehicle: Vehicle,
  options: MatchReasonOptions = {},
): VehicleMatchPresentation {
  const locale = options.locale ?? "en";
  const catalog = options.catalog ?? FALLBACK_SMART_MATCH_CATALOG;
  const lifestyle = resolveLifestyle(options);
  const chips: string[] = [];
  const seen = new Set<string>();

  if (
    options.inventoryFilters?.lifestyle &&
    isLifeCategoryId(options.inventoryFilters.lifestyle)
  ) {
    const lifeKey = options.inventoryFilters.lifestyle as LifeCategoryId;
    const lifeChip = LIFE_CATEGORY_CHIP[lifeKey];
    if (lifeChip) appendChip(chips, seen, chip(lifeChip, locale));
  } else if (lifestyle !== "any") {
    const lifestyleChip = LIFESTYLE_CHIP[lifestyle];
    if (lifestyleChip) appendChip(chips, seen, chip(lifestyleChip, locale));
  }

  chipsFromBodyStyle(vehicle, locale, seen, chips);
  chipsFromVehicleSignals(vehicle, locale, seen, chips);

  if (chips.length === 0) {
    appendChip(chips, seen, chip("easyDaily", locale));
  }

  const strictMatch = vehicleStrictLifestyleMatch(vehicle, lifestyle, catalog);
  const hasPhotos = vehicleHasPhotos(vehicle);
  const strongListing = vehicleListingQualityStrong(vehicle);

  let badge: VehicleHighlightBadge | null = null;
  if (hasPhotos && strongListing && strictMatch) {
    badge = "top-match";
  } else if (hasPhotos && (strongListing || strictMatch)) {
    badge = "recommended";
  }

  return { chips: chips.slice(0, 3), badge };
}

export function getVehicleMatchPresentationForInventory(
  vehicle: Vehicle,
  filters: InventoryFilters,
  catalog: SmartMatchRulesCatalog,
  locale: Locale = "en",
): VehicleMatchPresentation {
  const { matchFilters } = toInventoryMatchFilters(filters);
  return getVehicleMatchPresentation(vehicle, {
    locale,
    inventoryFilters: filters,
    matchFilters,
    lifestyle: matchFilters.lifestyle,
    shopperIntent: lifestyleToIntent(filters.lifestyle),
    catalog,
  });
}

export function getVehicleMatchPresentationForShopper(
  vehicle: Vehicle,
  intent: ShopperIntent,
  matchFilters: InventoryMatchFilters,
  catalog: SmartMatchRulesCatalog,
  locale: Locale = "en",
): VehicleMatchPresentation {
  return getVehicleMatchPresentation(vehicle, {
    locale,
    shopperIntent: intent,
    matchFilters,
    lifestyle: matchFilters.lifestyle,
    catalog,
  });
}
