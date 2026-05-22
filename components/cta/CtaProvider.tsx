"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { PORTAL_CTA_FALLBACKS } from "@/lib/portalCtaFallbacks";
import type { Locale } from "@/lib/i18n/types";
import type { PortalCtaKey, PortalCtaMap, PortalCtaValue } from "@/lib/portalCtaTypes";

const CtaContext = createContext<PortalCtaMap>(PORTAL_CTA_FALLBACKS);

export function CtaProvider({
  ctas,
  children,
}: {
  ctas: PortalCtaMap;
  children: ReactNode;
}) {
  const value = useMemo(() => ctas, [ctas]);
  return <CtaContext.Provider value={value}>{children}</CtaContext.Provider>;
}

function resolveCtaLabel(
  key: PortalCtaKey,
  entry: PortalCtaValue | undefined,
  locale: Locale,
): string {
  const fallback = PORTAL_CTA_FALLBACKS[key];
  if (locale === "es") {
    return (
      entry?.labelEs?.trim() ||
      fallback.labelEs ||
      entry?.label?.trim() ||
      fallback.label
    );
  }
  return entry?.label?.trim() || fallback.label;
}

export function useCta(key: PortalCtaKey): PortalCtaValue & { label: string } {
  const map = useContext(CtaContext);
  const { locale } = useLanguage();
  const entry = map[key];
  const fallback = PORTAL_CTA_FALLBACKS[key];
  const label = resolveCtaLabel(key, entry, locale);
  const url =
    entry?.url !== undefined && entry.url !== ""
      ? entry.url
      : fallback.url;
  return { label, labelEs: entry?.labelEs ?? fallback.labelEs, url };
}
