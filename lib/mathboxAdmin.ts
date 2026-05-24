import {
  isMathboxAppliesTo,
  isMathboxGroupName,
  isMathboxLineType,
} from "./pricingMathboxDefaults";
import type { PricingMathboxConfigRow } from "./pricingMathboxTypes";
import { getSupabaseAdmin } from "./supabaseAdmin";

const MATHBOX_SELECT =
  "id, line_key, label, label_es, source_key, group_name, line_type, display_order, is_active, is_conditional, show_when_zero, collapse_by_default, disclaimer_text, disclaimer_key, applies_to";

export interface PricingMathboxConfigDbRow extends PricingMathboxConfigRow {
  id: string;
}

export type MathboxConfigUpdateInput = Partial<
  Pick<
    PricingMathboxConfigRow,
    | "label"
    | "label_es"
    | "source_key"
    | "group_name"
    | "line_type"
    | "display_order"
    | "is_active"
    | "is_conditional"
    | "show_when_zero"
    | "collapse_by_default"
    | "disclaimer_text"
    | "disclaimer_key"
    | "applies_to"
  >
>;

interface MathboxDbRow {
  id: string;
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

function normalizeDbRow(row: MathboxDbRow): PricingMathboxConfigDbRow | null {
  const lineKey = row.line_key?.trim();
  if (!lineKey) return null;

  const groupName = row.group_name?.trim() ?? "standard";
  const lineType = row.line_type?.trim() ?? "charge";
  const appliesTo = row.applies_to?.trim() ?? "all";

  return {
    id: row.id,
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

export async function listMathboxConfigRows(): Promise<PricingMathboxConfigDbRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("portal_pricing_mathbox_config")
    .select(MATHBOX_SELECT)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to load math box config: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => normalizeDbRow(row as MathboxDbRow))
    .filter((row): row is PricingMathboxConfigDbRow => row != null);
}

export async function updateMathboxConfigRow(
  lineKey: string,
  input: MathboxConfigUpdateInput,
): Promise<PricingMathboxConfigDbRow> {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.label !== undefined) payload.label = input.label.trim();
  if (input.label_es !== undefined) {
    payload.label_es = input.label_es?.trim() || null;
  }
  if (input.source_key !== undefined) {
    payload.source_key = input.source_key.trim();
  }
  if (input.group_name !== undefined) {
    if (!isMathboxGroupName(input.group_name)) {
      throw new Error(`Invalid group_name: ${input.group_name}`);
    }
    payload.group_name = input.group_name;
  }
  if (input.line_type !== undefined) {
    if (!isMathboxLineType(input.line_type)) {
      throw new Error(`Invalid line_type: ${input.line_type}`);
    }
    payload.line_type = input.line_type;
  }
  if (input.display_order !== undefined) {
    payload.display_order = input.display_order;
  }
  if (input.is_active !== undefined) payload.is_active = input.is_active;
  if (input.is_conditional !== undefined) {
    payload.is_conditional = input.is_conditional;
  }
  if (input.show_when_zero !== undefined) {
    payload.show_when_zero = input.show_when_zero;
  }
  if (input.collapse_by_default !== undefined) {
    payload.collapse_by_default = input.collapse_by_default;
  }
  if (input.disclaimer_text !== undefined) {
    payload.disclaimer_text = input.disclaimer_text?.trim() || null;
  }
  if (input.disclaimer_key !== undefined) {
    payload.disclaimer_key = input.disclaimer_key?.trim() || null;
  }
  if (input.applies_to !== undefined) {
    if (!isMathboxAppliesTo(input.applies_to)) {
      throw new Error(`Invalid applies_to: ${input.applies_to}`);
    }
    payload.applies_to = input.applies_to;
  }

  const { data, error } = await supabase
    .from("portal_pricing_mathbox_config")
    .update(payload)
    .eq("line_key", lineKey)
    .select(MATHBOX_SELECT)
    .single();

  if (error) {
    throw new Error(`Failed to update math box line: ${error.message}`);
  }

  const normalized = normalizeDbRow(data as MathboxDbRow);
  if (!normalized) {
    throw new Error("Updated row could not be read");
  }
  return normalized;
}
