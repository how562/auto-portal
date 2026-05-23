import {
  normalizeVehicle,
  vehicleMatchesSmartMatchRule,
  type NormalizedVehicle,
} from "./inventoryMatch";
import type {
  SmartMatchLifestyleKey,
  SmartMatchRule,
  SmartMatchRulesCatalog,
} from "./smartMatchRulesTypes";
import { FALLBACK_SMART_MATCH_CATALOG } from "./smartMatchRulesFallback";
import type { Vehicle } from "./types";

/** Patches applied when selecting a life category or refinement chip. */
export interface LifeFilterPatch {
  condition?: "all" | "new" | "used" | "cpo";
  budget?:
    | "all"
    | "under-25k"
    | "under-30k"
    | "under-40k"
    | "30-50k"
    | "50k-plus";
  bodyStyle?: "all" | "suv" | "truck" | "sedan" | "coupe" | "van";
  lifestyle?: LifeCategoryId;
  lifeRefinement?: string | null;
}

/** URL-safe life category ids (Shop by Life + inventory `lifestyle` param). */
export type LifeCategoryId =
  | "family"
  | "work"
  | "luxury"
  | "budget"
  | "first-vehicle"
  | "fuel-efficient"
  | "weekend-ready"
  | "everyday-drive";

export interface LifeMatchRule {
  bodyStyles?: string[];
  keywords?: string[];
  makes?: string[];
  trimKeywords?: string[];
  modelKeywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  minMileage?: number;
  condition?: "new" | "used" | "cpo";
  excludeAbovePrice?: number;
}

export interface LifeRefinement {
  id: string;
  label: string;
  filterPatch?: LifeFilterPatch;
  matchRules?: LifeMatchRule[];
}

export interface LifeCategoryConfig {
  id: LifeCategoryId;
  title: string;
  description: string;
  ctaLabel: string;
  priority: number;
  resultTitle: string;
  resultSubtitle: string;
  emptyStateTitle: string;
  emptyStateBody: string;
  matchRules: LifeMatchRule[];
  refinements: LifeRefinement[];
  smartMatchKey?: SmartMatchLifestyleKey;
  impliedBodyStyle?: LifeFilterPatch["bodyStyle"];
}

const LUXURY_MAKES = [
  "cadillac",
  "bmw",
  "mercedes",
  "mercedes-benz",
  "lexus",
  "audi",
  "porsche",
  "lincoln",
  "genesis",
  "acura",
  "infiniti",
  "jaguar",
  "land rover",
  "volvo",
];

const PREMIUM_TRIM_KEYWORDS = [
  "premium",
  "platinum",
  "denali",
  "escalade",
  "prestige",
  "limited",
  "ultimate",
  "sport",
  " rs ",
  " amg",
  "m sport",
  "black label",
];

const FAMILY_MODEL_KEYWORDS = [
  "traverse",
  "yukon",
  "tahoe",
  "suburban",
  "acadia",
  "equinox",
  "pilot",
  "highlander",
  "explorer",
  "odyssey",
  "pacifica",
  "sienna",
  "telluride",
  "palisade",
];

const WORK_MODEL_KEYWORDS = [
  "sierra",
  "silverado",
  "f-150",
  "f150",
  "ram",
  "tundra",
  "tacoma",
  "colorado",
  "canyon",
  "ranger",
  "frontier",
  "titan",
];

const EFFICIENT_KEYWORDS = [
  "hybrid",
  "electric",
  " ev ",
  "phev",
  "plug-in",
  "bolt",
  "leaf",
  "prius",
  "mpg",
  "fuel efficient",
  "fuel economy",
  "e-tron",
  "ioniq",
];

const FIRST_CAR_MODELS = [
  "civic",
  "corolla",
  "elantra",
  "sentra",
  "mazda3",
  "impreza",
  "forte",
  "versa",
  "spark",
  "equinox",
  "escape",
  "rogue",
  "cx-5",
  "tucson",
];

export const LIFE_CATEGORIES: LifeCategoryConfig[] = [
  {
    id: "family",
    title: "Family",
    description: "Room for the kids, the gear, and everything in between.",
    ctaLabel: "Show family options",
    priority: 10,
    resultTitle: "Built for Your Crew",
    resultSubtitle: "Safe, spacious, and ready for everyday life.",
    emptyStateTitle: "Family options are on the way",
    emptyStateBody:
      "We are refreshing family-friendly SUVs and vans. Try removing a refinement or browse all inventory.",
    smartMatchKey: "family",
    impliedBodyStyle: "suv",
    matchRules: [
      {
        bodyStyles: ["suv", "crossover", "van", "minivan", "wagon"],
        keywords: [
          "third row",
          "3rd row",
          "7-passenger",
          "7 passenger",
          "8-passenger",
          "seating for 7",
          "seating for 8",
          "captain chair",
          "family",
          "safety",
        ],
      },
      { modelKeywords: FAMILY_MODEL_KEYWORDS },
    ],
    refinements: [
      {
        id: "third-row",
        label: "Third row",
        matchRules: [
          {
            keywords: [
              "third row",
              "3rd row",
              "7-passenger",
              "7 passenger",
              "8-passenger",
              "seating for 7",
              "seating for 8",
            ],
          },
        ],
      },
      {
        id: "safety-first",
        label: "Safety first",
        matchRules: [
          {
            keywords: [
              "safety",
              "blind spot",
              "lane assist",
              "lane departure",
              "adaptive cruise",
              "forward collision",
              "rear camera",
              "backup camera",
            ],
          },
        ],
      },
      {
        id: "cargo-space",
        label: "Cargo space",
        matchRules: [
          {
            keywords: [
              "cargo",
              "storage",
              "hatch",
              "power liftgate",
              "fold-flat",
              "fold flat",
              "spacious",
            ],
            bodyStyles: ["suv", "van", "minivan", "wagon"],
          },
        ],
      },
      {
        id: "budget-friendly",
        label: "Budget-friendly",
        filterPatch: { budget: "under-30k" },
      },
    ],
  },
  {
    id: "work",
    title: "Built for the Job",
    description: "Trucks and capability that show up when you need them.",
    ctaLabel: "Find work-ready vehicles",
    priority: 20,
    resultTitle: "Ready for Work and the Weekend",
    resultSubtitle: "Capability, utility, and comfort when you need it.",
    emptyStateTitle: "Work-ready inventory is updating",
    emptyStateBody:
      "New trucks and capability-focused vehicles arrive often. Clear refinements or browse all inventory.",
    smartMatchKey: "work",
    impliedBodyStyle: "truck",
    matchRules: [
      {
        bodyStyles: ["truck", "pickup", "van", "commercial"],
        keywords: [
          "work truck",
          "towing",
          "tow package",
          "trailer",
          "bed liner",
          "utility",
          "4x4",
          "4wd",
          "crew cab",
          "double cab",
          "supercrew",
          "super cab",
        ],
      },
      { modelKeywords: WORK_MODEL_KEYWORDS },
    ],
    refinements: [
      {
        id: "towing",
        label: "Towing",
        matchRules: [{ keywords: ["towing", "tow package", "trailer", "hitch"] }],
      },
      {
        id: "truck-bed",
        label: "Truck bed",
        matchRules: [
          {
            bodyStyles: ["truck", "pickup"],
            keywords: ["bed", "bed liner", "bed cover", "toolbox"],
          },
        ],
      },
      {
        id: "crew-cab",
        label: "Crew cab",
        matchRules: [
          {
            keywords: ["crew cab", "double cab", "supercrew", "super cab", "quad cab"],
          },
        ],
      },
      {
        id: "four-by-four",
        label: "4x4",
        matchRules: [
          { keywords: ["4x4", "4wd", "four-wheel", "four wheel", "awd"] },
        ],
      },
    ],
  },
  {
    id: "luxury",
    title: "Treat Yourself",
    description: "Premium comfort, elevated design, and a drive that feels different.",
    ctaLabel: "Explore premium options",
    priority: 30,
    resultTitle: "You Deserve a Better Drive",
    resultSubtitle: "Premium comfort, standout design, and elevated features.",
    emptyStateTitle: "Premium picks are coming soon",
    emptyStateBody:
      "Luxury inventory changes quickly. Try a refinement or explore the full lineup.",
    smartMatchKey: "luxury",
    matchRules: [
      { makes: LUXURY_MAKES },
      { trimKeywords: PREMIUM_TRIM_KEYWORDS },
      {
        keywords: [
          "leather",
          "premium audio",
          "bose",
          "harman",
          "panoramic",
          "sunroof",
          "massage",
          "ventilated",
          "heated seats",
          "navigation",
        ],
      },
      { minPrice: 45000 },
    ],
    refinements: [
      {
        id: "leather",
        label: "Leather",
        matchRules: [{ keywords: ["leather", "leather-appointed", "leatherette"] }],
      },
      {
        id: "premium-audio",
        label: "Premium audio",
        matchRules: [
          {
            keywords: [
              "premium audio",
              "bose",
              "harman",
              "bang & olufsen",
              "b&o",
              "mark levinson",
              "focal",
            ],
          },
        ],
      },
      {
        id: "panoramic-roof",
        label: "Panoramic roof",
        matchRules: [
          { keywords: ["panoramic", "sunroof", "moonroof", "skyroof"] },
        ],
      },
      {
        id: "performance",
        label: "Performance",
        matchRules: [
          {
            keywords: [
              "performance",
              "sport",
              "turbo",
              "v8",
              "amg",
              "m sport",
              "trd",
              "raptor",
            ],
            trimKeywords: ["sport", "performance", "rs", "amg"],
          },
        ],
      },
    ],
  },
  {
    id: "budget",
    title: "Keep It Affordable",
    description:
      "Options that fit your monthly budget — not just the sticker price.",
    ctaLabel: "See affordable options",
    priority: 40,
    resultTitle: "Drive More, Stress Less",
    resultSubtitle: "Smart options built around real budgets.",
    emptyStateTitle: "Value picks are restocking",
    emptyStateBody:
      "Affordable inventory turns fast. Widen your search or browse all vehicles.",
    smartMatchKey: "budget",
    matchRules: [
      { maxPrice: 30000 },
      {
        keywords: ["manager special", "special", "discount", "savings", "value"],
        maxPrice: 35000,
      },
      {
        maxPrice: 30000,
        maxMileage: 80000,
        condition: "used",
      },
    ],
    refinements: [
      {
        id: "under-30k",
        label: "Under $30k",
        filterPatch: { budget: "under-30k" },
      },
      {
        id: "best-savings",
        label: "Best savings",
        matchRules: [
          {
            keywords: [
              "manager special",
              "special",
              "discount",
              "savings",
              "markdown",
              "reduced",
            ],
          },
        ],
      },
      {
        id: "good-mpg",
        label: "Good MPG",
        matchRules: [{ keywords: EFFICIENT_KEYWORDS }],
      },
      {
        id: "used-options",
        label: "Used options",
        filterPatch: { condition: "used" },
      },
    ],
  },
  {
    id: "first-vehicle",
    title: "First Car",
    description: "Simple, reliable, and easy to get started.",
    ctaLabel: "Find first-car options",
    priority: 50,
    resultTitle: "Your First Drive Starts Here",
    resultSubtitle: "Approachable, reliable options without the overwhelm.",
    emptyStateTitle: "First-car picks are updating",
    emptyStateBody:
      "Starter-friendly inventory changes often. Try a refinement or see everything we have.",
    smartMatchKey: "first",
    matchRules: [
      {
        maxPrice: 25000,
        bodyStyles: ["sedan", "hatch", "crossover", "suv", "compact"],
      },
      {
        maxPrice: 40000,
        condition: "used",
        bodyStyles: ["sedan", "hatch", "crossover", "suv"],
      },
      { modelKeywords: FIRST_CAR_MODELS },
      {
        keywords: ["reliable", "easy", "starter", "first car", "commuter"],
        maxPrice: 35000,
      },
    ],
    refinements: [
      {
        id: "under-25k",
        label: "Under $25k",
        filterPatch: { budget: "under-25k" },
      },
      {
        id: "easy-to-own",
        label: "Easy to own",
        matchRules: [
          {
            keywords: ["reliable", "easy", "simple", "low maintenance", "commuter"],
            bodyStyles: ["sedan", "hatch", "crossover"],
          },
        ],
      },
      {
        id: "good-mpg",
        label: "Good MPG",
        matchRules: [{ keywords: EFFICIENT_KEYWORDS }],
      },
      {
        id: "used",
        label: "Used",
        filterPatch: { condition: "used" },
      },
    ],
  },
  {
    id: "fuel-efficient",
    title: "Save on Gas",
    description: "Go further on every tank and spend less along the way.",
    ctaLabel: "Show fuel-friendly vehicles",
    priority: 60,
    resultTitle: "Spend Less at the Pump",
    resultSubtitle: "Hybrids, EVs, and efficient daily drivers.",
    emptyStateTitle: "Efficient options are on the way",
    emptyStateBody:
      "Fuel-friendly inventory updates regularly. Clear refinements or browse all vehicles.",
    smartMatchKey: "efficient",
    matchRules: [
      { keywords: EFFICIENT_KEYWORDS },
      {
        bodyStyles: ["sedan", "hatch", "crossover"],
        maxPrice: 35000,
      },
      {
        keywords: ["30 mpg", "35 mpg", "40 mpg", "mpg"],
        bodyStyles: ["sedan", "hatch", "crossover", "suv"],
      },
    ],
    refinements: [
      {
        id: "hybrid",
        label: "Hybrid",
        matchRules: [{ keywords: ["hybrid", "phev", "plug-in"] }],
      },
      {
        id: "ev",
        label: "EV",
        matchRules: [
          {
            keywords: ["electric", " ev ", "bolt", "leaf", "ioniq", "mach-e"],
          },
        ],
      },
      {
        id: "30-plus-mpg",
        label: "30+ MPG",
        matchRules: [
          { keywords: ["30 mpg", "35 mpg", "40 mpg", "45 mpg", "50 mpg", "mpg"] },
        ],
      },
      {
        id: "small-suv",
        label: "Small SUV",
        filterPatch: { bodyStyle: "suv" },
        matchRules: [
          {
            keywords: ["compact", "crossover", "small suv"],
            bodyStyles: ["suv", "crossover"],
          },
        ],
      },
    ],
  },
  {
    id: "weekend-ready",
    title: "Weekend Ready",
    description: "Road trips, projects, and adventures without overthinking it.",
    ctaLabel: "Explore weekend vehicles",
    priority: 70,
    resultTitle: "Built for the Open Road",
    resultSubtitle: "Adventure-ready SUVs, trucks, and capable crossovers.",
    emptyStateTitle: "Weekend-ready inventory is updating",
    emptyStateBody:
      "Adventure-focused vehicles arrive often. Try a refinement or browse all inventory.",
    smartMatchKey: "weekend",
    matchRules: [
      {
        bodyStyles: ["suv", "truck", "pickup", "crossover"],
        keywords: [
          "awd",
          "4wd",
          "4x4",
          "off-road",
          "offroad",
          "roof rail",
          "roof rack",
          "towing",
          "trail",
          "adventure",
          "cargo",
          "all-terrain",
        ],
      },
      {
        trimKeywords: ["trail", "off-road", "adventure", "outdoor", "wilderness"],
      },
    ],
    refinements: [
      {
        id: "awd-4wd",
        label: "AWD/4WD",
        matchRules: [{ keywords: ["awd", "4wd", "4x4", "all-wheel", "four-wheel"] }],
      },
      {
        id: "off-road",
        label: "Off-road",
        matchRules: [
          {
            keywords: ["off-road", "offroad", "trail", "all-terrain", "skid plate"],
          },
        ],
      },
      {
        id: "cargo-space",
        label: "Cargo space",
        matchRules: [
          {
            keywords: ["cargo", "storage", "roof rack", "roof rail", "hitch"],
          },
        ],
      },
      {
        id: "towing",
        label: "Towing",
        matchRules: [{ keywords: ["towing", "tow package", "trailer", "hitch"] }],
      },
    ],
  },
  {
    id: "everyday-drive",
    title: "Everyday Drive",
    description: "Easy to drive, easy to park, and built for daily life.",
    ctaLabel: "Find daily drivers",
    priority: 80,
    resultTitle: "Your Daily, Elevated",
    resultSubtitle: "Comfortable, efficient, and easy to live with.",
    emptyStateTitle: "Daily drivers are restocking",
    emptyStateBody:
      "Commuter-friendly inventory turns quickly. Clear refinements or see the full lineup.",
    smartMatchKey: "everyday",
    matchRules: [
      {
        bodyStyles: ["sedan", "crossover", "suv", "hatch", "compact"],
        maxPrice: 45000,
        keywords: ["commuter", "daily", "comfort", "easy", "parking"],
      },
      {
        bodyStyles: ["sedan", "crossover"],
        keywords: EFFICIENT_KEYWORDS,
      },
      {
        bodyStyles: ["sedan", "crossover", "suv"],
        maxPrice: 35000,
        maxMileage: 60000,
      },
    ],
    refinements: [
      {
        id: "good-mpg",
        label: "Good MPG",
        matchRules: [{ keywords: EFFICIENT_KEYWORDS }],
      },
      {
        id: "easy-parking",
        label: "Easy parking",
        matchRules: [
          {
            keywords: ["compact", "easy", "parking", "city", "small"],
            bodyStyles: ["sedan", "hatch", "crossover"],
          },
        ],
      },
      {
        id: "comfortable",
        label: "Comfortable",
        matchRules: [
          {
            keywords: [
              "comfort",
              "heated seats",
              "leather",
              "quiet",
              "smooth",
              "premium cloth",
            ],
          },
        ],
      },
      {
        id: "low-mileage",
        label: "Low mileage",
        matchRules: [{ maxMileage: 35000 }],
      },
    ],
  },
];

const LIFE_BY_ID = new Map(LIFE_CATEGORIES.map((c) => [c.id, c]));

export function getLifeCategory(id: LifeCategoryId): LifeCategoryConfig {
  const config = LIFE_BY_ID.get(id);
  if (!config) throw new Error(`Unknown life category: ${id}`);
  return config;
}

export function isLifeCategoryId(value: string): value is LifeCategoryId {
  return LIFE_BY_ID.has(value as LifeCategoryId);
}

export const LIFE_CATEGORY_IDS = LIFE_CATEGORIES.map((c) => c.id);

function textIncludesAny(haystack: string, needles: string[]): boolean {
  if (needles.length === 0) return true;
  const padded = ` ${haystack} `;
  return needles.some((needle) => {
    const q = needle.trim().toLowerCase();
    if (!q) return false;
    return haystack.includes(q) || padded.includes(` ${q} `);
  });
}

function bodyStyleMatches(vehicle: NormalizedVehicle, styles: string[]): boolean {
  if (styles.length === 0) return true;
  return styles.some(
    (style) =>
      vehicle.body_style.includes(style) || vehicle.searchText.includes(style),
  );
}

function matchesLifeRule(
  vehicle: NormalizedVehicle,
  rule: LifeMatchRule,
): boolean {
  if (rule.bodyStyles?.length && !bodyStyleMatches(vehicle, rule.bodyStyles)) {
    return false;
  }

  if (rule.makes?.length) {
    const ok = rule.makes.some(
      (make) => vehicle.make.includes(make) || vehicle.searchText.includes(make),
    );
    if (!ok) return false;
  }

  if (rule.modelKeywords?.length) {
    const modelHaystack = `${vehicle.model} ${vehicle.searchText}`;
    if (!textIncludesAny(modelHaystack, rule.modelKeywords)) return false;
  }

  if (rule.trimKeywords?.length) {
    const trimHaystack = `${vehicle.trim} ${vehicle.searchText}`;
    if (!textIncludesAny(trimHaystack, rule.trimKeywords)) return false;
  }

  if (rule.keywords?.length && !textIncludesAny(vehicle.searchText, rule.keywords)) {
    return false;
  }

  if (rule.condition) {
    if (rule.condition === "cpo" && vehicle.conditionNorm !== "cpo") return false;
    if (rule.condition !== "cpo" && vehicle.conditionNorm !== rule.condition) {
      return false;
    }
  }

  const price = vehicle.price;

  if (rule.excludeAbovePrice != null && price != null && price > rule.excludeAbovePrice) {
    return false;
  }

  if (rule.minPrice != null) {
    if (price == null || price < rule.minPrice) return false;
  }

  if (rule.maxPrice != null) {
    if (price != null && price > rule.maxPrice) return false;
  }

  if (rule.maxMileage != null) {
    if (vehicle.mileage == null || vehicle.mileage > rule.maxMileage) return false;
  }

  if (rule.minMileage != null) {
    if (vehicle.mileage == null || vehicle.mileage < rule.minMileage) return false;
  }

  return true;
}

function matchesSmartMatchCatalog(
  vehicle: NormalizedVehicle,
  key: SmartMatchLifestyleKey,
  catalog: SmartMatchRulesCatalog,
): boolean {
  const rules = catalog[key] ?? [];
  if (rules.length === 0) return false;
  return rules.some((rule: SmartMatchRule) =>
    vehicleMatchesSmartMatchRule(vehicle, rule),
  );
}

/** Vehicle matches a life category via smart-match rules OR config heuristics. */
export function vehicleMatchesLifeCategory(
  vehicle: Vehicle | NormalizedVehicle,
  categoryId: LifeCategoryId,
  catalog: SmartMatchRulesCatalog = FALLBACK_SMART_MATCH_CATALOG,
): boolean {
  const normalized =
    "searchText" in vehicle ? vehicle : normalizeVehicle(vehicle);
  const config = getLifeCategory(categoryId);

  if (
    config.smartMatchKey &&
    matchesSmartMatchCatalog(normalized, config.smartMatchKey, catalog)
  ) {
    return true;
  }

  if (config.matchRules.some((rule) => matchesLifeRule(normalized, rule))) {
    return true;
  }

  return false;
}

export function vehicleMatchesLifeRefinement(
  vehicle: Vehicle | NormalizedVehicle,
  categoryId: LifeCategoryId,
  refinementId: string,
): boolean {
  const refinement = getLifeCategory(categoryId).refinements.find(
    (r) => r.id === refinementId,
  );
  if (!refinement?.matchRules?.length) return true;

  const normalized =
    "searchText" in vehicle ? vehicle : normalizeVehicle(vehicle);
  return refinement.matchRules.some((rule) => matchesLifeRule(normalized, rule));
}

export function getLifeRefinement(
  categoryId: LifeCategoryId,
  refinementId: string,
): LifeRefinement | null {
  return (
    getLifeCategory(categoryId).refinements.find((r) => r.id === refinementId) ??
    null
  );
}

export function countLifeCategory(
  vehicles: Vehicle[],
  categoryId: LifeCategoryId,
  catalog?: SmartMatchRulesCatalog,
): number {
  return vehicles.filter((v) =>
    vehicleMatchesLifeCategory(v, categoryId, catalog),
  ).length;
}

export function filtersFromLifeCategory(
  categoryId: LifeCategoryId,
  refinementId?: string | null,
): LifeFilterPatch {
  const config = getLifeCategory(categoryId);
  const patch: LifeFilterPatch = {
    lifestyle: categoryId,
    lifeRefinement: refinementId ?? null,
  };

  if (config.impliedBodyStyle && config.impliedBodyStyle !== "all") {
    patch.bodyStyle = config.impliedBodyStyle;
  }

  if (refinementId) {
    const refinement = getLifeRefinement(categoryId, refinementId);
    if (refinement?.filterPatch) {
      Object.assign(patch, refinement.filterPatch);
    }
  }

  return patch;
}

export function getLifeResultMessaging(categoryId: LifeCategoryId): {
  title: string;
  subtitle: string;
} {
  const config = getLifeCategory(categoryId);
  return {
    title: config.resultTitle,
    subtitle: config.resultSubtitle,
  };
}

export function getLifeEmptyState(categoryId: LifeCategoryId): {
  title: string;
  body: string;
} {
  const config = getLifeCategory(categoryId);
  return {
    title: config.emptyStateTitle,
    body: config.emptyStateBody,
  };
}

export function lifeCategoryToSmartMatchKey(
  categoryId: LifeCategoryId,
): SmartMatchLifestyleKey | undefined {
  return getLifeCategory(categoryId).smartMatchKey;
}
