"use client";

import type { ReactNode } from "react";
import { CtaProvider } from "@/components/cta/CtaProvider";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { NavigationProvider } from "@/components/navigation/NavigationProvider";
import { SmartMatchRulesProvider } from "@/components/providers/SmartMatchRulesProvider";
import { TextSettingsProvider } from "@/components/providers/TextSettingsProvider";
import type { PortalCtaMap } from "@/lib/portalCtaTypes";
import type { PortalNavigation } from "@/lib/navigationTypes";
import type { PortalTextMap } from "@/lib/portalTextTypes";
import type { SmartMatchRulesCatalog } from "@/lib/smartMatchRulesTypes";

export function AppProviders({
  navigation,
  ctas,
  portalTexts,
  smartMatchRules,
  children,
}: {
  navigation: PortalNavigation;
  ctas: PortalCtaMap;
  portalTexts: PortalTextMap;
  smartMatchRules: SmartMatchRulesCatalog;
  children: ReactNode;
}) {
  return (
    <LanguageProvider>
      <TextSettingsProvider texts={portalTexts}>
        <SmartMatchRulesProvider catalog={smartMatchRules}>
          <CtaProvider ctas={ctas}>
            <NavigationProvider navigation={navigation}>
              {children}
            </NavigationProvider>
          </CtaProvider>
        </SmartMatchRulesProvider>
      </TextSettingsProvider>
    </LanguageProvider>
  );
}
