import { normalizeSmartMatchLifestyleKey } from "./smartMatchLifestyle";
import type { SmartMatchRuleCondition } from "./smartMatchRulesTypes";
import { getSupabaseAdmin } from "./supabaseAdmin";

const RULE_SELECT =
  "id, lifestyle, priority, label_en, label_es, body_styles, makes, model_keywords, trim_keywords, min_price, max_price, condition, is_active, created_at, updated_at";

export interface SmartMatchRuleAdminRow {
  id: string;
  lifestyle: string;
  priority: number;
  label_en: string | null;
  label_es: string | null;
  body_styles: string[];
  makes: string[];
  model_keywords: string[];
  trim_keywords: string[];
  min_price: number | null;
  max_price: number | null;
  condition: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SmartMatchRuleUpdateInput {
  label_en?: string | null;
  label_es?: string | null;
  body_styles?: string[];
  makes?: string[];
  model_keywords?: string[];
  trim_keywords?: string[];
  min_price?: number | null;
  max_price?: number | null;
  condition?: string | null;
  priority?: number;
  is_active?: boolean;
}

function parseStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseConditionForDb(
  value: string | null | undefined,
): SmartMatchRuleCondition | null {
  if (!value) return null;
  const c = value.trim().toLowerCase();
  if (c === "any" || c === "") return null;
  if (c === "new" || c === "used" || c === "cpo") return c;
  return null;
}

function normalizeRow(row: Record<string, unknown>): SmartMatchRuleAdminRow | null {
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;

  const lifestyle =
    typeof row.lifestyle === "string" ? row.lifestyle.trim() : "";

  return {
    id,
    lifestyle,
    priority: typeof row.priority === "number" ? row.priority : 0,
    label_en:
      typeof row.label_en === "string" ? row.label_en.trim() || null : null,
    label_es:
      typeof row.label_es === "string" ? row.label_es.trim() || null : null,
    body_styles: parseStringArray(row.body_styles),
    makes: parseStringArray(row.makes),
    model_keywords: parseStringArray(row.model_keywords),
    trim_keywords: parseStringArray(row.trim_keywords),
    min_price:
      typeof row.min_price === "number" && Number.isFinite(row.min_price)
        ? row.min_price
        : null,
    max_price:
      typeof row.max_price === "number" && Number.isFinite(row.max_price)
        ? row.max_price
        : null,
    condition:
      typeof row.condition === "string" ? row.condition.trim() || null : null,
    is_active: row.is_active !== false,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function listSmartMatchRulesAdmin(): Promise<SmartMatchRuleAdminRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("smart_match_rules")
    .select(RULE_SELECT)
    .order("lifestyle", { ascending: true })
    .order("priority", { ascending: true });

  if (error) {
    throw new Error(`Failed to load smart match rules: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => normalizeRow(row as Record<string, unknown>))
    .filter((row): row is SmartMatchRuleAdminRow => row != null);
}

export async function updateSmartMatchRule(
  id: string,
  input: SmartMatchRuleUpdateInput,
): Promise<SmartMatchRuleAdminRow> {
  const ruleId = id.trim();
  if (!ruleId) throw new Error("id is required");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.label_en !== undefined) {
    payload.label_en = input.label_en?.trim() || null;
  }
  if (input.label_es !== undefined) {
    payload.label_es = input.label_es?.trim() || null;
  }
  if (input.body_styles !== undefined) {
    payload.body_styles = input.body_styles;
  }
  if (input.makes !== undefined) {
    payload.makes = input.makes;
  }
  if (input.model_keywords !== undefined) {
    payload.model_keywords = input.model_keywords;
  }
  if (input.trim_keywords !== undefined) {
    payload.trim_keywords = input.trim_keywords;
  }
  if (input.min_price !== undefined) {
    payload.min_price = input.min_price;
  }
  if (input.max_price !== undefined) {
    payload.max_price = input.max_price;
  }
  if (input.condition !== undefined) {
    payload.condition = parseConditionForDb(input.condition);
  }
  if (input.priority !== undefined) {
    payload.priority = input.priority;
  }
  if (input.is_active !== undefined) {
    payload.is_active = input.is_active;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("smart_match_rules")
    .update(payload)
    .eq("id", ruleId)
    .select(RULE_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to update smart match rule: ${error.message}`);
  }

  const normalized = normalizeRow(data as Record<string, unknown>);
  if (!normalized) {
    throw new Error("Updated row could not be read");
  }

  if (!normalizeSmartMatchLifestyleKey(normalized.lifestyle)) {
    console.warn(
      `smart_match_rules: lifestyle "${normalized.lifestyle}" is not a canonical key`,
    );
  }

  return normalized;
}
