"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import {
  FALLBACK_FOOTER_NAV,
  FALLBACK_HEADER_NAV,
} from "@/lib/navigationFallback";
import { translatePortalNavigation } from "@/lib/navigationI18n";
import type { PortalNavigation } from "@/lib/navigationTypes";

const NavigationContext = createContext<PortalNavigation>({
  header: FALLBACK_HEADER_NAV,
  footer: FALLBACK_FOOTER_NAV,
});

export function NavigationProvider({
  navigation,
  children,
}: {
  navigation: PortalNavigation;
  children: ReactNode;
}) {
  const { locale } = useLanguage();
  const value = useMemo(
    () => translatePortalNavigation(navigation, locale),
    [navigation, locale],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function usePortalNavigation(): PortalNavigation {
  return useContext(NavigationContext);
}
