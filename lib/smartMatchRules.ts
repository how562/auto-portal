import { FALLBACK_SMART_MATCH_CATALOG } from "./smartMatchRulesFallback";
import {
  SMART_MATCH_LIFESTYLE_KEYS,
  normalizeSmartMatchLifestyleKey,
} from "./smartMatchLifestyle";
import type {
  SmartMatchLifestyleKey,
  SmartMatchRule,
  SmartMatchRulesCatalog,
} from "./smartMatchRulesTypes";
import type { SmartMatchRuleCondition } from "./smartMatchRulesTypes";
import { mergeSmartMatchCatalogWithFallback } from "./smartMatchRulesMerge";
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
  const lifestyle = normalizeSmartMatchLifestyleKey(row.lifestyle);
  if (!lifestyle) return null;

  return {
    id: String(row.id),
    lifestyle,
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
    catalog[rule.lifestyle].push(rule);
  }

  return catalog;
}

function buildEmptyCatalog(): SmartMatchRulesCatalog {
  const catalog = {} as SmartMatchRulesCatalog;
  for (const key of SMART_MATCH_LIFESTYLE_KEYS) {
    catalog[key] = [];
  }
  return catalog;
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

  if (process.env.NODE_ENV === "development") {
    console.warn(`smart_match_rules: ${error.message}`);
  }
  return null;
}

/** Load active rules ordered by priority; uses local fallback when DB is empty or unavailable. */
export async function fetchSmartMatchRules(): Promise<SmartMatchRulesCatalog> {
  try {
    const rows = await fetchRuleRows();
    if (!rows || rows.length === 0) {
      return FALLBACK_SMART_MATCH_CATALOG;
    }
    return mergeSmartMatchCatalogWithFallback(buildSmartMatchCatalog(rows));
  } catch {
    return FALLBACK_SMART_MATCH_CATALOG;
  }
}

export function getPrimaryRuleForLifestyle(
  catalog: SmartMatchRulesCatalog,
  lifestyle: SmartMatchLifestyleKey,
): SmartMatchRule | null {
  const rules = catalog[lifestyle] ?? [];
  return rules.length > 0 ? rules[0] : null;
}
