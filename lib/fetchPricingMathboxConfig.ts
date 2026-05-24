import {
  getDefaultPricingMathboxConfig,
  mergePricingMathboxConfig,
} from "./buildPricingMathbox";
import {
  isMathboxAppliesTo,
  isMathboxGroupName,
  isMathboxLineType,
} from "./pricingMathboxDefaults";
import type { PricingMathboxConfigRow } from "./pricingMathboxTypes";
import { getSupabase } from "./supabase";

const MATHBOX_SELECT =
  "line_key, label, label_es, source_key, group_name, line_type, display_order, is_active, is_conditional, show_when_zero, collapse_by_default, disclaimer_text, disclaimer_key, applies_to";

interface MathboxDbRow {
  line_key: string;
  label: string;
  label_es?: string | null;
  source_key: string;
  group_name: string;
  line_type: string;
  display_order: number;
  is_active: boolean;
  is_conditional: boolean;
  show_when_zero: boolean;
  collapse_by_default: boolean;
  disclaimer_text?: string | null;
  disclaimer_key?: string | null;
  applies_to: string;
}

function isMissingTableError(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    msg.includes("Could not find the table") ||
    msg.includes("schema cache")
  );
}

function normalizeRow(row: MathboxDbRow): PricingMathboxConfigRow | null {
  const lineKey = row.line_key?.trim();
  if (!lineKey) return null;

  const groupName = row.group_name?.trim() ?? "standard";
  const lineType = row.line_type?.trim() ?? "charge";
  const appliesTo = row.applies_to?.trim() ?? "all";

  return {
    line_key: lineKey,
    label: row.label?.trim() || lineKey,
    label_es: row.label_es?.trim() || null,
    source_key: row.source_key?.trim() || lineKey,
    group_name: isMathboxGroupName(groupName) ? groupName : "standard",
    line_type: isMathboxLineType(lineType) ? lineType : "charge",
    display_order: typeof row.display_order === "number" ? row.display_order : 0,
    is_active: row.is_active !== false,
    is_conditional: row.is_conditional === true,
    show_when_zero: row.show_when_zero === true,
    collapse_by_default: row.collapse_by_default === true,
    disclaimer_text: row.disclaimer_text?.trim() || null,
    disclaimer_key: row.disclaimer_key?.trim() || null,
    applies_to: isMathboxAppliesTo(appliesTo) ? appliesTo : "all",
  };
}

export async function fetchPricingMathboxConfig(): Promise<PricingMathboxConfigRow[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return getDefaultPricingMathboxConfig();
  }

  const { data, error } = await supabase
    .from("portal_pricing_mathbox_config")
    .select(MATHBOX_SELECT)
    .order("display_order", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return getDefaultPricingMathboxConfig();
    console.error("[Mathbox] Failed to load config:", error.message);
    return getDefaultPricingMathboxConfig();
  }

  const rows = (data ?? [])
    .map((row) => normalizeRow(row as MathboxDbRow))
    .filter((row): row is PricingMathboxConfigRow => row != null);

  if (rows.length === 0) return getDefaultPricingMathboxConfig();
  return mergePricingMathboxConfig(rows);
}

export { buildPricingMathbox, getDefaultPricingMathboxConfig, mergePricingMathboxConfig } from "./buildPricingMathbox";
