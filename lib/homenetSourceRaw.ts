import { isUsablePrice } from "./format";

/** HomeNet DealerSend keys referenced in migrations and the importer. */
export const HOMENET_PRICE_KEYS = {
  internetPrice: [
    "Internet_Price",
    "InternetPrice",
    "Price",
    "DealerPrice",
  ],
  sellingPrice: ["SellingPrice"],
  msrp: ["MSRP"],
  originalMsrp: ["OriginalMSRP", "OriginalMSRP"],
} as const;

/** Keys that may carry incentive/rebate amounts when present in the feed. */
export const HOMENET_INCENTIVE_KEY_HINTS = [
  "Customer_Cash",
  "Dealer_Cash",
  "Incentive_Cash",
  "Total_Rebate",
  "Rebate",
  "RebateAmount",
  "Cash_Incentive",
  "Bonus_Cash",
  "Loyalty_Cash",
  "Military_Cash",
  "College_Cash",
] as const;

export const HOMENET_DOC_FEE_KEY_HINTS = [
  "DocFee",
  "Doc_Fee",
  "DocumentationFee",
  "Documentation_Fee",
  "Dealer_Doc_Fee",
] as const;

const EXCLUDED_FROM_INCENTIVE_SCAN =
  /^(internet_price|sellingprice|msrp|originalmsrp|price|dealerprice|mileage|miles|vin|stock)/i;

function parseRawPrice(value: unknown): number | null {
  if (value == null) return null;
  const text = String(value).replace(/[$,]/g, "").trim();
  if (!text) return null;
  const n = Number.parseFloat(text);
  return isUsablePrice(n) ? n : null;
}

function firstRawPrice(
  raw: Record<string, unknown> | null | undefined,
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

export function normalizeSourceRaw(
  value: unknown,
): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export function readHomenetPricesFromSourceRaw(
  raw: Record<string, unknown> | null | undefined,
): {
  internetPrice: number | null;
  sellingPrice: number | null;
  msrp: number | null;
  originalMsrp: number | null;
} {
  return {
    internetPrice: firstRawPrice(raw, HOMENET_PRICE_KEYS.internetPrice),
    sellingPrice: firstRawPrice(raw, HOMENET_PRICE_KEYS.sellingPrice),
    msrp: firstRawPrice(raw, HOMENET_PRICE_KEYS.msrp),
    originalMsrp: firstRawPrice(raw, HOMENET_PRICE_KEYS.originalMsrp),
  };
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
}

export interface FeedIncentiveLine {
  id: string;
  label: string;
  amount: number;
}

/** Incentive/rebate lines with positive amounts from source_raw only. */
export function readFeedIncentivesFromSourceRaw(
  raw: Record<string, unknown> | null | undefined,
): FeedIncentiveLine[] {
  if (!raw) return [];

  const lines: FeedIncentiveLine[] = [];
  const seen = new Set<string>();

  for (const key of HOMENET_INCENTIVE_KEY_HINTS) {
    const amount = parseRawPrice(raw[key]);
    if (amount == null) continue;
    const id = key.toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    lines.push({ id, label: humanizeKey(key), amount });
  }

  for (const [key, value] of Object.entries(raw)) {
    if (EXCLUDED_FROM_INCENTIVE_SCAN.test(key.replace(/\s/g, ""))) continue;
    if (!/rebate|incentive|cash|allowance|bonus/i.test(key)) continue;
    const amount = parseRawPrice(value);
    if (amount == null) continue;
    const id = key.toLowerCase();
    if (seen.has(id)) continue;
    seen.add(id);
    lines.push({ id, label: humanizeKey(key), amount });
  }

  return lines;
}

export function readDocFeeFromSourceRaw(
  raw: Record<string, unknown> | null | undefined,
): number | null {
  if (!raw) return null;
  for (const key of HOMENET_DOC_FEE_KEY_HINTS) {
    const fee = parseRawPrice(raw[key]);
    if (fee != null) return fee;
  }
  for (const [key, value] of Object.entries(raw)) {
    if (!/doc(umentation)?[_\s]?fee/i.test(key)) continue;
    const fee = parseRawPrice(value);
    if (fee != null) return fee;
  }
  return null;
}
