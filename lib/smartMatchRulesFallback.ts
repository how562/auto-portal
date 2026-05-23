import type {
  SmartMatchLifestyleKey,
  SmartMatchRule,
  SmartMatchRulesCatalog,
} from "./smartMatchRulesTypes";

function rule(
  lifestyleKey: SmartMatchLifestyleKey,
  priority: number,
  partial: Omit<SmartMatchRule, "id" | "lifestyleKey" | "priority">,
): SmartMatchRule {
  return {
    id: `fallback-${lifestyleKey}`,
    lifestyleKey,
    priority,
    ...partial,
  };
}

const FALLBACK_RULES: SmartMatchRule[] = [
  rule("family", 10, {
    labelEn: "Spacious SUV or van fit for family and daily life",
    labelEs: "SUV o van espaciosa para familia y día a día",
    bodyStyles: ["suv", "crossover", "van", "minivan", "wagon"],
    makes: [],
    modelKeywords: [
      "traverse",
      "yukon",
      "tahoe",
      "suburban",
      "acadia",
      "equinox",
    ],
    trimKeywords: [],
    minPrice: null,
    maxPrice: null,
    condition: null,
  }),
  rule("work", 20, {
    labelEn: "Truck or capability-focused match for work and towing",
    labelEs: "Camioneta o opción con capacidad de trabajo y remolque",
    bodyStyles: ["truck", "pickup"],
    makes: [],
    modelKeywords: [
      "sierra",
      "silverado",
      "f-150",
      "ram",
      "tundra",
      "tacoma",
      "towing",
      "tow",
    ],
    trimKeywords: [],
    minPrice: null,
    maxPrice: null,
    condition: null,
  }),
  rule("luxury", 30, {
    labelEn: "Premium pricing in a luxury band",
    labelEs: "Precio en rango de lujo",
    bodyStyles: [],
    makes: [],
    modelKeywords: [],
    trimKeywords: [],
    minPrice: 45000,
    maxPrice: null,
    condition: null,
  }),
  rule("luxury", 31, {
    labelEn: "Premium brand or elevated trim",
    labelEs: "Marca premium o versión elevada",
    bodyStyles: [],
    makes: [
      "cadillac",
      "land rover",
      "jaguar",
      "bmw",
      "mercedes",
      "lexus",
      "audi",
      "porsche",
      "lincoln",
      "genesis",
      "acura",
      "infiniti",
    ],
    modelKeywords: ["premium", "platinum", "denali", "escalade"],
    trimKeywords: [],
    minPrice: null,
    maxPrice: null,
    condition: null,
  }),
  rule("budget", 40, {
    labelEn: "Value-forward pricing under $30k",
    labelEs: "Precio accesible por debajo de $30k",
    bodyStyles: [],
    makes: [],
    modelKeywords: [],
    trimKeywords: [],
    minPrice: null,
    maxPrice: 30000,
    condition: null,
  }),
  rule("first", 50, {
    labelEn: "Approachable pre-owned option for a first vehicle",
    labelEs: "Seminuevo accesible ideal como primer vehículo",
    bodyStyles: [],
    makes: [],
    modelKeywords: [],
    trimKeywords: [],
    minPrice: null,
    maxPrice: 40000,
    condition: "used",
  }),
  rule("efficient", 60, {
    labelEn: "Hybrid, electric, or fuel-efficient daily driver",
    labelEs: "Híbrido, eléctrico o eficiente para el día a día",
    bodyStyles: ["hatch", "sedan"],
    makes: [],
    modelKeywords: [
      "hybrid",
      "electric",
      "ev",
      "phev",
      "plug-in",
      "bolt",
      "leaf",
      "prius",
      "mpg",
      "fuel efficient",
    ],
    trimKeywords: [],
    minPrice: null,
    maxPrice: 35000,
    condition: null,
  }),
  rule("weekend", 70, {
    labelEn: "Adventure-ready SUV or truck for weekends and road trips",
    labelEs: "SUV o camioneta lista para aventuras y viajes",
    bodyStyles: ["suv", "truck", "pickup", "crossover"],
    makes: [],
    modelKeywords: [
      "awd",
      "4wd",
      "4x4",
      "off-road",
      "towing",
      "trail",
      "adventure",
      "roof rack",
    ],
    trimKeywords: ["trail", "off-road", "adventure"],
    minPrice: null,
    maxPrice: null,
    condition: null,
  }),
  rule("everyday", 80, {
    labelEn: "Comfortable, efficient daily driver",
    labelEs: "Conductor diario cómodo y eficiente",
    bodyStyles: ["sedan", "crossover", "suv", "hatch", "compact"],
    makes: [],
    modelKeywords: ["commuter", "daily", "mpg", "hybrid", "comfort"],
    trimKeywords: [],
    minPrice: null,
    maxPrice: 45000,
    condition: null,
  }),
];

export function buildFallbackSmartMatchCatalog(): SmartMatchRulesCatalog {
  const catalog = {} as SmartMatchRulesCatalog;
  for (const row of FALLBACK_RULES) {
    if (!catalog[row.lifestyleKey]) {
      catalog[row.lifestyleKey] = [];
    }
    catalog[row.lifestyleKey].push(row);
  }
  for (const key of Object.keys(catalog) as SmartMatchLifestyleKey[]) {
    catalog[key].sort((a, b) => a.priority - b.priority);
  }
  return catalog;
}

export const FALLBACK_SMART_MATCH_CATALOG = buildFallbackSmartMatchCatalog();
