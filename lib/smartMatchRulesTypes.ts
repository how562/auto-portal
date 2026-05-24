export type SmartMatchLifestyleKey =
  | "family"
  | "work"
  | "luxury"
  | "budget"
  | "first-vehicle"
  | "fuel-efficient"
  | "weekend-ready"
  | "everyday-drive";

export type SmartMatchRuleCondition = "new" | "used" | "cpo";

export interface SmartMatchRule {
  id: string;
  /** Matches `smart_match_rules.lifestyle` (unique rule identifier). */
  lifestyle: SmartMatchLifestyleKey;
  priority: number;
  labelEn: string | null;
  labelEs: string | null;
  bodyStyles: string[];
  makes: string[];
  modelKeywords: string[];
  trimKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
  condition: SmartMatchRuleCondition | null;
}

/** How strictly a Supabase rule is applied when matching vehicles. */
export type SmartMatchRuleMode =
  | "strict"
  | "noCondition"
  | "noPriceNoCondition"
  | "identityOnly";

/** Active rules grouped by lifestyle, each list sorted by priority ascending. */
export type SmartMatchRulesCatalog = Record<
  SmartMatchLifestyleKey,
  SmartMatchRule[]
>;
