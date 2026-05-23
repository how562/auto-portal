export type SmartMatchLifestyleKey =
  | "family"
  | "work"
  | "luxury"
  | "budget"
  | "first"
  | "efficient"
  | "weekend"
  | "everyday";

export type SmartMatchRuleCondition = "new" | "used" | "cpo";

export interface SmartMatchRule {
  id: string;
  lifestyleKey: SmartMatchLifestyleKey;
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

/** Active rules grouped by lifestyle, each list sorted by priority ascending. */
export type SmartMatchRulesCatalog = Record<
  SmartMatchLifestyleKey,
  SmartMatchRule[]
>;
