"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  BudgetRange,
  ConditionFilter,
  ShopperIntent,
} from "@/lib/types";

export type LifestyleChoice =
  | "family"
  | "work"
  | "luxury"
  | "budget"
  | "first-vehicle"
  | "fuel-efficient";

const LIFESTYLE_INTENT: Record<LifestyleChoice, ShopperIntent> = {
  family: "family-suv",
  work: "work-truck",
  luxury: "luxury",
  budget: "under-30k",
  "first-vehicle": "first-time",
  "fuel-efficient": "fuel-efficient",
};

interface DiscoveryState {
  intent: ShopperIntent;
  budget: BudgetRange;
  condition: ConditionFilter;
  lifestyle: LifestyleChoice | null;
  guidedStep: 1 | 2 | 3;
  setIntent: (intent: ShopperIntent) => void;
  setBudget: (budget: BudgetRange) => void;
  setCondition: (condition: ConditionFilter) => void;
  setGuidedStep: (step: 1 | 2 | 3) => void;
  applyLifestyle: (choice: LifestyleChoice) => void;
  scrollToGuided: () => void;
}

const DiscoveryContext = createContext<DiscoveryState | null>(null);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [intent, setIntent] = useState<ShopperIntent>("any");
  const [budget, setBudget] = useState<BudgetRange>("any");
  const [condition, setCondition] = useState<ConditionFilter>("either");
  const [lifestyle, setLifestyle] = useState<LifestyleChoice | null>(null);
  const [guidedStep, setGuidedStep] = useState<1 | 2 | 3>(1);

  const scrollToGuided = useCallback(() => {
    document
      .getElementById("guided-discovery")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const applyLifestyle = useCallback(
    (choice: LifestyleChoice) => {
      setLifestyle(choice);
      setIntent(LIFESTYLE_INTENT[choice]);
      setGuidedStep(2);
      scrollToGuided();
    },
    [scrollToGuided],
  );

  const value = useMemo(
    () => ({
      intent,
      budget,
      condition,
      lifestyle,
      guidedStep,
      setIntent,
      setBudget,
      setCondition,
      setGuidedStep,
      applyLifestyle,
      scrollToGuided,
    }),
    [
      intent,
      budget,
      condition,
      lifestyle,
      guidedStep,
      applyLifestyle,
      scrollToGuided,
    ],
  );

  return (
    <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>
  );
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext);
  if (!ctx) {
    throw new Error("useDiscovery must be used within DiscoveryProvider");
  }
  return ctx;
}
