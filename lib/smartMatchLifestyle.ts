import type { Locale } from "./i18n/types";
import type { SmartMatchLifestyleKey } from "./smartMatchRulesTypes";

/** Canonical lifestyle keys stored in smart_match_rules.lifestyle. */
export const SMART_MATCH_LIFESTYLE_KEYS: SmartMatchLifestyleKey[] = [
  "family",
  "work",
  "luxury",
  "budget",
  "first-vehicle",
  "fuel-efficient",
  "weekend-ready",
  "everyday-drive",
];

const LIFESTYLE_KEY_SET = new Set<string>(SMART_MATCH_LIFESTYLE_KEYS);

/** Map deprecated DB keys to canonical keys (read-only compatibility). */
const LEGACY_LIFESTYLE_KEYS: Record<string, SmartMatchLifestyleKey> = {
  first: "first-vehicle",
  efficient: "fuel-efficient",
  weekend: "weekend-ready",
  everyday: "everyday-drive",
};

export function isSmartMatchLifestyleKey(
  value: string,
): value is SmartMatchLifestyleKey {
  return LIFESTYLE_KEY_SET.has(value);
}

export function normalizeSmartMatchLifestyleKey(
  value: string | null | undefined,
): SmartMatchLifestyleKey | null {
  const key = value?.trim().toLowerCase();
  if (!key) return null;
  if (isSmartMatchLifestyleKey(key)) return key;
  return LEGACY_LIFESTYLE_KEYS[key] ?? null;
}

/** Customer-facing lifestyle labels — never expose admin merchandising terms. */
export const LIFESTYLE_FRIENDLY_LABELS: Record<
  SmartMatchLifestyleKey,
  { en: string; es: string }
> = {
  family: {
    en: "Great for families",
    es: "Ideal para familias",
  },
  work: {
    en: "Built for work",
    es: "Hecho para el trabajo",
  },
  luxury: {
    en: "Luxury picks",
    es: "Opciones de lujo",
  },
  budget: {
    en: "Smart value picks",
    es: "Opciones con buen valor",
  },
  "first-vehicle": {
    en: "First-car friendly",
    es: "Ideal como primer auto",
  },
  "fuel-efficient": {
    en: "Fuel efficient picks",
    es: "Opciones eficientes",
  },
  "weekend-ready": {
    en: "Weekend adventure ready",
    es: "Listos para el fin de semana",
  },
  "everyday-drive": {
    en: "Everyday drivers",
    es: "Para el día a día",
  },
};

export function getLifestyleFriendlyLabel(
  lifestyle: SmartMatchLifestyleKey,
  locale: Locale = "en",
): string {
  const labels = LIFESTYLE_FRIENDLY_LABELS[lifestyle];
  return locale === "es" ? labels.es : labels.en;
}
