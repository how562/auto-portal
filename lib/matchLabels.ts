import type { ShopperIntent } from "./types";

const INTENT_LABELS: Record<ShopperIntent, string> = {
  any: "Group Pick",
  "family-suv": "Family Fit",
  "work-truck": "Work Ready",
  luxury: "Luxury Pick",
  "under-30k": "Budget Smart",
  "first-time": "Starter Choice",
  "fuel-efficient": "Efficient Choice",
};

/** Shown as legend above Smart Match results */
export const MATCH_BADGE_LEGEND = [
  "Family Fit",
  "Work Ready",
  "Budget Smart",
  "Luxury Pick",
  "Efficient Choice",
] as const;

export function getMatchLabel(intent: ShopperIntent): string {
  return INTENT_LABELS[intent] ?? "Group Pick";
}
