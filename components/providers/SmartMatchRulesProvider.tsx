"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { FALLBACK_SMART_MATCH_CATALOG } from "@/lib/smartMatchRulesFallback";
import type { SmartMatchRulesCatalog } from "@/lib/smartMatchRulesTypes";

const SmartMatchRulesContext = createContext<SmartMatchRulesCatalog | null>(
  null,
);

export function SmartMatchRulesProvider({
  catalog,
  children,
}: {
  catalog: SmartMatchRulesCatalog;
  children: ReactNode;
}) {
  const value = useMemo(() => catalog, [catalog]);
  return (
    <SmartMatchRulesContext.Provider value={value}>
      {children}
    </SmartMatchRulesContext.Provider>
  );
}

export function useSmartMatchRulesCatalog(): SmartMatchRulesCatalog {
  const ctx = useContext(SmartMatchRulesContext);
  return ctx ?? FALLBACK_SMART_MATCH_CATALOG;
}
