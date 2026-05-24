/**
 * Body-style normalization for Smart Match and life-category matching.
 * Dealer feed values (e.g. "Sport Utility") are matched via synonym groups, not equality.
 */

export type BodyStyleCategory =
  | "suv"
  | "truck"
  | "sedan"
  | "coupe"
  | "van"
  | "hatch"
  | "wagon"
  | "convertible";

/** Canonical groups — longer phrases are checked first within each category. */
const BODY_STYLE_SYNONYMS: Record<BodyStyleCategory, readonly string[]> = {
  suv: [
    "sport utility",
    "sport-utility",
    "cross-over",
    "cross over",
    "crossover",
    "utility vehicle",
    "s.u.v",
    "suv",
    "cuv",
  ],
  truck: ["pick-up", "pick up", "pickup", "truck"],
  sedan: ["4 door sedan", "4-door sedan", "saloon", "sedan"],
  coupe: ["2 door coupe", "2-door coupe", "coupe"],
  van: ["mini van", "minivan", "passenger van", "cargo van", "van"],
  hatch: ["hatch back", "hatchback", "hatch"],
  wagon: ["station wagon", "sport wagon", "wagon", "estate"],
  convertible: ["convertible", "cabriolet", "roadster"],
};

const CATEGORY_ORDER: BodyStyleCategory[] = [
  "suv",
  "truck",
  "van",
  "wagon",
  "sedan",
  "hatch",
  "coupe",
  "convertible",
];

/** Rule / filter tokens → canonical category (includes common DB rule tokens). */
const RULE_TOKEN_TO_CATEGORY: Record<string, BodyStyleCategory> = {
  suv: "suv",
  crossover: "suv",
  cuv: "suv",
  utility: "suv",
  truck: "truck",
  pickup: "truck",
  sedan: "sedan",
  saloon: "sedan",
  coupe: "coupe",
  van: "van",
  minivan: "van",
  hatch: "hatch",
  hatchback: "hatch",
  wagon: "wagon",
  estate: "wagon",
  convertible: "convertible",
  compact: "sedan",
};

function normalizeHaystack(bodyStyle: string, searchText = ""): string {
  return `${bodyStyle} ${searchText}`.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Categories detected in a vehicle body-style + search haystack. */
export function resolveBodyStyleCategories(
  bodyStyle: string,
  searchText = "",
): Set<BodyStyleCategory> {
  const haystack = normalizeHaystack(bodyStyle, searchText);
  const found = new Set<BodyStyleCategory>();

  for (const category of CATEGORY_ORDER) {
    const synonyms = [...BODY_STYLE_SYNONYMS[category]].sort(
      (a, b) => b.length - a.length,
    );
    if (synonyms.some((phrase) => haystack.includes(phrase))) {
      found.add(category);
    }
  }

  return found;
}

/** Map a rule token or filter slug to a canonical category, if known. */
export function ruleTokenToCategory(token: string): BodyStyleCategory | null {
  const key = token.trim().toLowerCase();
  if (!key) return null;

  if (key in RULE_TOKEN_TO_CATEGORY) {
    return RULE_TOKEN_TO_CATEGORY[key];
  }

  for (const category of CATEGORY_ORDER) {
    if (
      BODY_STYLE_SYNONYMS[category].some(
        (phrase) => key === phrase || key.includes(phrase) || phrase.includes(key),
      )
    ) {
      return category;
    }
  }

  return null;
}

/**
 * True when any rule body-style token matches the vehicle (category-aware, includes-based).
 */
export function vehicleMatchesBodyStyleTokens(
  bodyStyle: string,
  searchText: string,
  ruleTokens: string[],
): boolean {
  if (ruleTokens.length === 0) return true;

  const haystack = normalizeHaystack(bodyStyle, searchText);
  const vehicleCategories = resolveBodyStyleCategories(bodyStyle, searchText);

  return ruleTokens.some((raw) => {
    const token = raw.trim().toLowerCase();
    if (!token) return false;

    const category = ruleTokenToCategory(token);
    if (category) {
      return vehicleCategories.has(category);
    }

    return haystack.includes(token);
  });
}

export type ShopperBodyStyleFilter =
  | "any"
  | "suv"
  | "truck"
  | "sedan"
  | "coupe"
  | "van";

const FILTER_TO_CATEGORY: Record<
  Exclude<ShopperBodyStyleFilter, "any">,
  BodyStyleCategory
> = {
  suv: "suv",
  truck: "truck",
  sedan: "sedan",
  coupe: "coupe",
  van: "van",
};

/** Shopper body-style filter (inventory / Smart Match UI). */
export function matchesShopperBodyStyleFilter(
  bodyStyle: string,
  searchText: string,
  filter: ShopperBodyStyleFilter,
): boolean {
  if (filter === "any") return true;
  const vehicleCategories = resolveBodyStyleCategories(bodyStyle, searchText);
  return vehicleCategories.has(FILTER_TO_CATEGORY[filter]);
}
