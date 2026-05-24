import { FALLBACK_SMART_MATCH_CATALOG } from "./smartMatchRulesFallback";
import { SMART_MATCH_LIFESTYLE_KEYS } from "./smartMatchLifestyle";
import type { SmartMatchRulesCatalog } from "./smartMatchRulesTypes";

function buildEmptyCatalog(): SmartMatchRulesCatalog {
  const catalog = {} as SmartMatchRulesCatalog;
  for (const key of SMART_MATCH_LIFESTYLE_KEYS) {
    catalog[key] = [];
  }
  return catalog;
}

/** Fill empty lifestyle buckets from local fallback rules. Safe for client bundles. */
export function mergeSmartMatchCatalogWithFallback(
  catalog: SmartMatchRulesCatalog,
): SmartMatchRulesCatalog {
  const merged = buildEmptyCatalog();
  for (const lifestyle of SMART_MATCH_LIFESTYLE_KEYS) {
    const dbRules = catalog[lifestyle] ?? [];
    merged[lifestyle] =
      dbRules.length > 0
        ? dbRules
        : [...FALLBACK_SMART_MATCH_CATALOG[lifestyle]];
  }
  return merged;
}
