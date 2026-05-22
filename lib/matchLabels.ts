import type { TranslationKey, Translator } from "./i18n/translations";
import type { ShopperIntent } from "./types";

const INTENT_LABEL_KEYS: Record<ShopperIntent, TranslationKey> = {
  any: "match.any",
  "family-suv": "match.familySuv",
  "work-truck": "match.workTruck",
  luxury: "match.luxury",
  "under-30k": "match.under30k",
  "first-time": "match.firstTime",
  "fuel-efficient": "match.fuelEfficient",
};

const INTENT_LABELS_EN: Record<ShopperIntent, string> = {
  any: "Group Pick",
  "family-suv": "Family Fit",
  "work-truck": "Work Ready",
  luxury: "Luxury Pick",
  "under-30k": "Budget Smart",
  "first-time": "Starter Choice",
  "fuel-efficient": "Efficient Choice",
};

/** Shown as legend above Smart Match results */
export const MATCH_BADGE_LEGEND_EN = [
  "Family Fit",
  "Work Ready",
  "Budget Smart",
  "Luxury Pick",
  "Efficient Choice",
] as const;

export function getMatchLabel(intent: ShopperIntent, t?: Translator): string {
  const key = INTENT_LABEL_KEYS[intent];
  if (t && key) {
    return t(key, INTENT_LABELS_EN[intent]);
  }
  return INTENT_LABELS_EN[intent] ?? "Group Pick";
}

export function getMatchBadgeLegend(t?: Translator): string[] {
  const intents: ShopperIntent[] = [
    "family-suv",
    "work-truck",
    "under-30k",
    "luxury",
    "fuel-efficient",
  ];
  return intents.map((intent) => getMatchLabel(intent, t));
}
