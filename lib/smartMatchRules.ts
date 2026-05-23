import { FALLBACK_SMART_MATCH_CATALOG } from "./smartMatchRulesFallback";
import type {
  SmartMatchLifestyleKey,
  SmartMatchRule,
  SmartMatchRulesCatalog,
} from "./smartMatchRulesTypes";
import type { SmartMatchRuleCondition } from "./smartMatchRulesTypes";
import { getSupabase } from "./supabase";

const RULE_SELECT =
  "id, lifestyle, priority, label_en, label_es, body_styles, makes, model_keywords, trim_keywords, min_price, max_price, condition";

interface SmartMatchRuleRow {
  id: string;
  lifestyle: string;
  priority: number;
  label_en?: string | null;
  label_es?: string | null;
  body_styles?: string[] | null;
  makes?: string[] | null;
  model_keywords?: string[] | null;
  trim_keywords?: string[] | null;
  min_price?: number | null;
  max_price?: number | null;
  condition?: string | null;
}

const LIFESTYLE_KEYS = new Set<string>([
  "family",
  "work",
  "luxury",
  "budget",
  "first",
  "efficient",
  "weekend",
  "everyday",
]);

function isLifestyleKey(value: string): value is SmartMatchLifestyleKey {
  return LIFESTYLE_KEYS.has(value);
}

function parseStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parseStringArray(parsed);
    } catch {
      return value
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }
  }
  return [];
}

function parseCondition(
  value: string | null | undefined,
): SmartMatchRuleCondition | null {
  if (!value) return null;
  const c = value.trim().toLowerCase();
  if (c === "new" || c === "used" || c === "cpo" || c === "any") {
    return c === "any" ? null : c;
  }
  return null;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function normalizeSmartMatchRuleRow(
  row: SmartMatchRuleRow,
): SmartMatchRule | null {
  const lifestyleKey = row.lifestyle?.trim().toLowerCase();
  if (!lifestyleKey || !isLifestyleKey(lifestyleKey)) return null;

  return {
    id: String(row.id),
    lifestyleKey,
    priority: typeof row.priority === "number" ? row.priority : 0,
    labelEn: row.label_en?.trim() || null,
    labelEs: row.label_es?.trim() || null,
    bodyStyles: parseStringArray(row.body_styles),
    makes: parseStringArray(row.makes),
    modelKeywords: parseStringArray(row.model_keywords),
    trimKeywords: parseStringArray(row.trim_keywords),
    minPrice: parseNumber(row.min_price),
    maxPrice: parseNumber(row.max_price),
    condition: parseCondition(row.condition),
  };
}

export function buildSmartMatchCatalog(
  rows: SmartMatchRuleRow[],
): SmartMatchRulesCatalog {
  const catalog = buildEmptyCatalog();

  const normalized = rows
    .map(normalizeSmartMatchRuleRow)
    .filter((rule): rule is SmartMatchRule => rule !== null)
    .sort((a, b) => a.priority - b.priority);

  for (const rule of normalized) {
    catalog[rule.lifestyleKey].push(rule);
  }

  return mergeWithFallback(catalog);
}

function buildEmptyCatalog(): SmartMatchRulesCatalog {
  return {
    family: [],
    work: [],
    luxury: [],
    budget: [],
    first: [],
    efficient: [],
    weekend: [],
    everyday: [],
  };
}

/** Ensure every lifestyle has at least fallback rules when DB rows are missing. */
function mergeWithFallback(
  fromDb: SmartMatchRulesCatalog,
): SmartMatchRulesCatalog {
  const merged = buildEmptyCatalog();
  const keys = Object.keys(merged) as SmartMatchLifestyleKey[];

  for (const key of keys) {
    merged[key] =
      fromDb[key].length > 0 ? fromDb[key] : FALLBACK_SMART_MATCH_CATALOG[key];
  }

  return merged;
}

function isMissingTableError(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    msg.includes("Could not find the table") ||
    msg.includes("schema cache")
  );
}

async function fetchRuleRows(): Promise<SmartMatchRuleRow[] | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("smart_match_rules")
    .select(RULE_SELECT)
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (!error) {
    return (data ?? []) as SmartMatchRuleRow[];
  }

  if (isMissingTableError(error)) return null;

  console.warn(`smart_match_rules: ${error.message}`);
  return null;
}

/** Load active rules ordered by priority; uses local fallback when DB is empty or unavailable. */
export async function fetchSmartMatchRules(): Promise<SmartMatchRulesCatalog> {
  try {
    const rows = await fetchRuleRows();
    if (!rows || rows.length === 0) {
      return FALLBACK_SMART_MATCH_CATALOG;
    }
    return buildSmartMatchCatalog(rows);
  } catch {
    return FALLBACK_SMART_MATCH_CATALOG;
  }
}
