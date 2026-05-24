import { getEffectiveVehiclePrice, isUsablePrice } from "./format";
import {
  normalizeSourceRaw,
  readDocFeeFromSourceRaw,
  readFeedIncentivesFromSourceRaw,
  readHomenetPricesFromSourceRaw,
} from "./homenetSourceRaw";
import type { VehicleDetail } from "./types";

export interface PricingSourceAmount {
  amount: number | null;
  text?: string | null;
}

export interface ConditionalIncentiveSource {
  id: string;
  label: string;
  amount: number;
  description?: string | null;
}

export interface VehiclePricingSources {
  values: Record<string, PricingSourceAmount>;
  conditionalIncentives: ConditionalIncentiveSource[];
  /** True when feed has more than basic selling/internet price. */
  hasFullPricing: boolean;
}

function pickUsable(
  ...values: (number | null | undefined)[]
): number | null {
  for (const value of values) {
    if (isUsablePrice(value)) return value;
  }
  return null;
}

function parseRawPrice(value: unknown): number | null {
  if (value == null) return null;
  const text = String(value).replace(/[$,]/g, "").trim();
  if (!text) return null;
  const n = Number.parseFloat(text);
  return isUsablePrice(n) ? n : null;
}

function firstRawPrice(
  raw: Record<string, unknown> | null,
  keys: readonly string[],
): number | null {
  if (!raw) return null;
  for (const key of keys) {
    if (key in raw) {
      const price = parseRawPrice(raw[key]);
      if (price != null) return price;
    }
    const match = Object.entries(raw).find(
      ([k]) => k.toLowerCase() === key.toLowerCase(),
    );
    if (match) {
      const price = parseRawPrice(match[1]);
      if (price != null) return price;
    }
  }
  return null;
}

/** vAuto / HomeNet invoice field candidates. */
const INVOICE_KEYS = [
  "Invoice",
  "InvoicePrice",
  "invoice",
  "invoice_price",
  "DealerInvoice",
] as const;

/** Feed-provided dealer discount (not derived). */
const DEALER_DISCOUNT_KEYS = [
  "DealerDiscount",
  "dealer_discount",
  "Dealer_Discount",
  "Discount",
  "TotalDiscount",
] as const;

function readVAutoConditionalIncentives(
  raw: Record<string, unknown> | null,
): ConditionalIncentiveSource[] {
  if (!raw) return [];

  const items: ConditionalIncentiveSource[] = [];
  const seen = new Set<string>();

  for (const [key, value] of Object.entries(raw)) {
    if (!/incentive|rebate|allowance|bonus/i.test(key)) continue;
    if (/description|desc|label|name|text/i.test(key)) continue;

    const amount = parseRawPrice(value);
    if (amount == null) continue;

    const baseKey = key
      .replace(/(_amount|_value|_cash|Amount|Value)$/i, "")
      .toLowerCase();
    if (seen.has(baseKey)) continue;
    seen.add(baseKey);

    const descKey = Object.keys(raw).find((k) => {
      const kl = k.toLowerCase();
      return (
        kl.includes(baseKey.replace(/_/g, "")) &&
        /description|desc|label|name|text/i.test(kl)
      );
    });
    const description =
      descKey && raw[descKey] != null ? String(raw[descKey]).trim() : null;

    items.push({
      id: baseKey,
      label: key
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim(),
      amount,
      description: description || null,
    });
  }

  return items;
}

/**
 * Collects all pricing values from mapped vehicle columns and source_raw.
 * Never invents amounts — derived dealer discount only when msrp and internet_price exist.
 */
export function buildVehiclePricingSources(
  vehicle: VehicleDetail,
): VehiclePricingSources {
  const raw = normalizeSourceRaw(vehicle.source_raw);
  const fromRaw = readHomenetPricesFromSourceRaw(raw);

  const msrp = pickUsable(vehicle.msrp, fromRaw.msrp, fromRaw.originalMsrp);
  const internetPrice = pickUsable(
    vehicle.internet_price,
    fromRaw.internetPrice,
  );
  const salePrice = pickUsable(vehicle.sale_price, fromRaw.sellingPrice);
  const invoice = firstRawPrice(raw, INVOICE_KEYS);
  const feedDealerDiscount = firstRawPrice(raw, DEALER_DISCOUNT_KEYS);

  const dealerDiscountDerived =
    msrp != null &&
    internetPrice != null &&
    msrp > internetPrice
      ? msrp - internetPrice
      : null;

  const docFee = readDocFeeFromSourceRaw(raw);
  const effective = getEffectiveVehiclePrice(vehicle);

  const homenetIncentives = readFeedIncentivesFromSourceRaw(raw).map((row) => ({
    id: row.id,
    label: row.label,
    amount: row.amount,
    description: null as string | null,
  }));
  const vautoIncentives = readVAutoConditionalIncentives(raw);

  const incentiveMap = new Map<string, ConditionalIncentiveSource>();
  for (const item of [...homenetIncentives, ...vautoIncentives]) {
    if (!incentiveMap.has(item.id)) {
      incentiveMap.set(item.id, item);
    }
  }
  const conditionalIncentives = Array.from(incentiveMap.values());

  const values: Record<string, PricingSourceAmount> = {
    msrp: { amount: msrp },
    internet_price: { amount: internetPrice },
    sale_price: { amount: salePrice },
    selling_price: { amount: salePrice },
    invoice: { amount: invoice },
    dealer_discount: { amount: feedDealerDiscount },
    dealer_discount_derived: { amount: dealerDiscountDerived },
    doc_fee: { amount: docFee },
    final_price: { amount: effective.amount },
  };

  const hasFullPricing =
    msrp != null ||
    feedDealerDiscount != null ||
    dealerDiscountDerived != null ||
    invoice != null ||
    conditionalIncentives.length > 0 ||
    docFee != null;

  return {
    values,
    conditionalIncentives,
    hasFullPricing,
  };
}
