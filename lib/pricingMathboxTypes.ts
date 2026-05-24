export type MathboxLineType =
  | "charge"
  | "discount"
  | "subtotal"
  | "final"
  | "info";

export type MathboxGroupName =
  | "standard"
  | "discounts"
  | "conditional"
  | "fees"
  | "final";

export type MathboxAppliesTo = "all" | "new" | "used" | "certified";

export interface PricingMathboxConfigRow {
  line_key: string;
  label: string;
  label_es: string | null;
  source_key: string;
  group_name: MathboxGroupName;
  line_type: MathboxLineType;
  display_order: number;
  is_active: boolean;
  is_conditional: boolean;
  show_when_zero: boolean;
  collapse_by_default: boolean;
  disclaimer_text: string | null;
  disclaimer_key: string | null;
  applies_to: MathboxAppliesTo;
}

export interface ResolvedMathboxLine {
  lineKey: string;
  label: string;
  /** Pre-formatted display string (price, credit, info text). */
  displayValue: string;
  lineType: MathboxLineType;
  groupName: MathboxGroupName;
  isConditional: boolean;
  disclaimerText: string | null;
  disclaimerKey: string | null;
  displayOrder: number;
  /** Optional feed description (conditional incentives). */
  description?: string | null;
}

export interface ResolvedMathboxGroup {
  groupName: MathboxGroupName;
  displayOrder: number;
  lines: ResolvedMathboxLine[];
  collapseByDefault: boolean;
}

export interface PricingMathboxResult {
  hasPrice: boolean;
  simplifiedMode: boolean;
  groups: ResolvedMathboxGroup[];
  disclaimers: string[];
}
