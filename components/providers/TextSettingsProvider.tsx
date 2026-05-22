"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/i18n/types";
import type { PortalTextMap } from "@/lib/portalTextTypes";

interface TextSettingsContextValue {
  texts: PortalTextMap;
  resolvePortalText: (key: string, fallback: string, locale: Locale) => string;
}

const TextSettingsContext = createContext<TextSettingsContextValue | null>(null);

export function TextSettingsProvider({
  texts,
  children,
}: {
  texts: PortalTextMap;
  children: ReactNode;
}) {
  const resolvePortalText = useCallback(
    (key: string, fallback: string, locale: Locale): string => {
      const entry = texts[key];
      if (!entry) return fallback;
      const en = entry.labelEn?.trim();
      const es = entry.labelEs?.trim();
      if (locale === "es") {
        return es || en || fallback;
      }
      return en || fallback;
    },
    [texts],
  );

  const value = useMemo(
    () => ({ texts, resolvePortalText }),
    [texts, resolvePortalText],
  );

  return (
    <TextSettingsContext.Provider value={value}>
      {children}
    </TextSettingsContext.Provider>
  );
}

export function usePortalText(key: string, fallback: string): string {
  const ctx = useContext(TextSettingsContext);
  const { locale } = useLanguage();

  if (!ctx) {
    if (locale === "es") return fallback;
    return fallback;
  }

  return ctx.resolvePortalText(key, fallback, locale);
}

export function useOptionalPortalText(
  key: string,
  fallback: string,
): string {
  const ctx = useContext(TextSettingsContext);
  const language = useLanguage();

  if (!ctx) return fallback;
  return ctx.resolvePortalText(key, fallback, language.locale);
}
