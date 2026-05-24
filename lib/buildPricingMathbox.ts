import { formatPrice } from "./format";
import type { Locale } from "./i18n/types";
import {
  HOMENET_SIMPLIFIED_SOURCE_KEYS,
  MATHBOX_GROUP_ORDER,
  PRICING_MATHBOX_DEFAULTS,
} from "./pricingMathboxDefaults";
import type {
  MathboxAppliesTo,
  PricingMathboxConfigRow,
  PricingMathboxResult,
  ResolvedMathboxGroup,
  ResolvedMathboxLine,
} from "./pricingMathboxTypes";
import { buildVehiclePricingSources } from "./pricingSourceRegistry";
import { isUsedVehicle } from "./vdpDisplay";
import type { VehicleDetail } from "./types";

function vehicleAppliesTo(
  vehicle: Pick<VehicleDetail, "condition">,
): Exclude<MathboxAppliesTo, "all"> {
  const condition = vehicle.condition?.trim().toLowerCase() ?? "";
  if (condition === "new") return "new";
  if (condition.includes("cert") || condition === "cpo") return "certified";
  if (isUsedVehicle(vehicle.condition)) return "used";
  return "used";
}

function rowAppliesToVehicle(
  appliesTo: MathboxAppliesTo,
  scope: Exclude<MathboxAppliesTo, "all">,
): boolean {
  if (appliesTo === "all") return true;
  if (appliesTo === "used") {
    return scope === "used" || scope === "certified";
  }
  return appliesTo === scope;
}

function resolveLabel(row: PricingMathboxConfigRow, locale: Locale): string {
  if (locale === "es" && row.label_es?.trim()) {
    return row.label_es.trim();
  }
  return row.label.trim();
}

function formatAmount(
  amount: number,
  lineType: PricingMathboxConfigRow["line_type"],
): string {
  if (lineType === "discount") return `−${formatPrice(amount)}`;
  return formatPrice(amount);
}

function formatFeeAmount(amount: number): string {
  return `+${formatPrice(amount)}`;
}

function isEligibleAmount(
  amount: number | null | undefined,
  showWhenZero: boolean,
): amount is number {
  if (amount == null || !Number.isFinite(amount)) return false;
  if (amount === 0 && !showWhenZero) return false;
  if (amount < 0 && !showWhenZero) return false;
  return true;
}

function mergeConfig(
  rows: PricingMathboxConfigRow[],
): PricingMathboxConfigRow[] {
  const byKey = new Map<string, PricingMathboxConfigRow>();
  for (const fallback of PRICING_MATHBOX_DEFAULTS) {
    byKey.set(fallback.line_key, { ...fallback });
  }
  for (const row of rows) {
    const existing = byKey.get(row.line_key);
    byKey.set(row.line_key, { ...(existing ?? {}), ...row } as PricingMathboxConfigRow);
  }
  return Array.from(byKey.values());
}

export function mergePricingMathboxConfig(
  rows: PricingMathboxConfigRow[],
): PricingMathboxConfigRow[] {
  return mergeConfig(rows);
}

export function getDefaultPricingMathboxConfig(): PricingMathboxConfigRow[] {
  return PRICING_MATHBOX_DEFAULTS.map((row) => ({ ...row }));
}

export function buildPricingMathbox(
  vehicle: VehicleDetail,
  configRows: PricingMathboxConfigRow[],
  locale: Locale = "en",
): PricingMathboxResult {
  const sources = buildVehiclePricingSources(vehicle);
  const simplifiedMode = !sources.hasFullPricing;
  const scope = vehicleAppliesTo(vehicle);
  const merged = mergeConfig(configRows);

  const activeConfig = merged
    .filter((row) => row.is_active !== false)
    .filter((row) => rowAppliesToVehicle(row.applies_to, scope))
    .filter((row) => {
      if (!simplifiedMode) return true;
      if (row.source_key.startsWith("_")) return true;
      return HOMENET_SIMPLIFIED_SOURCE_KEYS.has(row.source_key);
    })
    .sort((a, b) => a.display_order - b.display_order);

  const resolvedLines: ResolvedMathboxLine[] = [];
  let conditionalRendered = false;

  for (const row of activeConfig) {
    if (row.source_key === "conditional_incentives") {
      if (sources.conditionalIncentives.length === 0) continue;
      conditionalRendered = true;
      for (const incentive of sources.conditionalIncentives) {
        resolvedLines.push({
          lineKey: `${row.line_key}:${incentive.id}`,
          label: incentive.label,
          displayValue: formatAmount(incentive.amount, "discount"),
          lineType: "discount",
          groupName: "conditional",
          isConditional: true,
          disclaimerText: row.disclaimer_text,
          disclaimerKey: row.disclaimer_key,
          displayOrder: row.display_order,
          description: incentive.description,
        });
      }
      continue;
    }

    if (row.source_key === "_conditional_unavailable") {
      continue;
    }

    if (row.source_key === "_pricing_disclaimer") {
      resolvedLines.push({
        lineKey: row.line_key,
        label: "",
        displayValue: row.disclaimer_text ?? "",
        lineType: "info",
        groupName: row.group_name,
        isConditional: false,
      disclaimerText: null,
      disclaimerKey: row.disclaimer_key,
      displayOrder: row.display_order,
      });
      continue;
    }

    const source = sources.values[row.source_key];
    const amount = source?.amount ?? null;
    if (!isEligibleAmount(amount, row.show_when_zero)) continue;

    if (
      row.source_key === "internet_price" &&
      row.line_type !== "final" &&
      sources.values.final_price?.amount === amount &&
      sources.values.msrp?.amount === amount
    ) {
      continue;
    }

    const displayValue =
      row.group_name === "fees" && row.line_type === "charge"
        ? formatFeeAmount(amount)
        : formatAmount(amount, row.line_type);

    resolvedLines.push({
      lineKey: row.line_key,
      label: resolveLabel(row, locale),
      displayValue,
      lineType: row.line_type,
      groupName: row.group_name,
      isConditional: row.is_conditional,
      disclaimerText: row.disclaimer_text,
      disclaimerKey: row.disclaimer_key,
      displayOrder: row.display_order,
    });
  }

  const conditionalConfig = activeConfig.find(
    (row) => row.source_key === "_conditional_unavailable",
  );
  if (
    !conditionalRendered &&
    conditionalConfig &&
    sources.conditionalIncentives.length === 0
  ) {
    resolvedLines.push({
      lineKey: conditionalConfig.line_key,
      label: "",
      displayValue: "",
      lineType: "info",
      groupName: "conditional",
      isConditional: true,
      disclaimerText: conditionalConfig.disclaimer_text,
      disclaimerKey: conditionalConfig.disclaimer_key,
      displayOrder: conditionalConfig.display_order,
    });
  }

  const groupMap = new Map<string, ResolvedMathboxGroup>();

  for (const line of resolvedLines) {
    const existing = groupMap.get(line.groupName);
    if (existing) {
      existing.lines.push(line);
    } else {
      const collapseRow = merged.find(
        (row) =>
          row.group_name === line.groupName &&
          row.is_conditional &&
          row.collapse_by_default,
      );
      groupMap.set(line.groupName, {
        groupName: line.groupName,
        displayOrder: MATHBOX_GROUP_ORDER[line.groupName] ?? 99,
        lines: [line],
        collapseByDefault: collapseRow?.collapse_by_default ?? false,
      });
    }
  }

  const groups = Array.from(groupMap.values()).sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );

  for (const group of groups) {
    group.lines.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  const hasPrice = isEligibleAmount(
    sources.values.final_price?.amount,
    false,
  );

  const disclaimers = merged
    .filter((row) => row.disclaimer_text?.trim())
    .map((row) => row.disclaimer_text!.trim());

  return {
    hasPrice,
    simplifiedMode,
    groups,
    disclaimers,
  };
}

export interface VehiclePricingBreakdown {
  hasPrice: boolean;
  displayPrice: number | null;
  msrp: number | null;
  internetPrice: number | null;
  salePrice: number | null;
  dealerDiscount: number | null;
  docFee: number | null;
  feedIncentives: { id: string; label: string; amount: number }[];
  incentivesMapped: boolean;
}

/** @deprecated Use buildPricingMathbox — kept for any legacy imports. */
export function buildVehiclePricingBreakdown(vehicle: import("./types").VehicleDetail): VehiclePricingBreakdown {
  const sources = buildVehiclePricingSources(vehicle);
  return {
    hasPrice: sources.values.final_price?.amount != null,
    displayPrice: sources.values.final_price?.amount ?? null,
    msrp: sources.values.msrp?.amount ?? null,
    internetPrice: sources.values.internet_price?.amount ?? null,
    salePrice: sources.values.sale_price?.amount ?? null,
    dealerDiscount:
      sources.values.dealer_discount?.amount ??
      sources.values.dealer_discount_derived?.amount ??
      null,
    docFee: sources.values.doc_fee?.amount ?? null,
    feedIncentives: sources.conditionalIncentives.map((i) => ({
      id: i.id,
      label: i.label,
      amount: i.amount,
    })),
    incentivesMapped: sources.conditionalIncentives.length > 0,
  };
}
