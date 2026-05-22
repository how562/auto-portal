"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { LifestyleChoice } from "@/components/portal/DiscoveryContext";
import { countByCategory } from "@/lib/categoryCounts";
import { useSmartMatchRulesCatalog } from "@/components/providers/SmartMatchRulesProvider";
import {
  buildInventoryUrl,
  filtersFromShopByLife,
} from "@/lib/inventoryMatch";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cardCategory } from "@/lib/cardClasses";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { Vehicle } from "@/lib/types";

const CATEGORY_IDS: LifestyleChoice[] = [
  "family",
  "work",
  "luxury",
  "budget",
  "first-vehicle",
  "fuel-efficient",
];

const CATEGORY_KEYS: Record<
  LifestyleChoice,
  { label: TranslationKey; desc: TranslationKey }
> = {
  family: { label: "categories.family", desc: "categories.familyDesc" },
  work: { label: "categories.work", desc: "categories.workDesc" },
  luxury: { label: "categories.luxury", desc: "categories.luxuryDesc" },
  budget: { label: "categories.budget", desc: "categories.budgetDesc" },
  "first-vehicle": {
    label: "categories.firstVehicle",
    desc: "categories.firstVehicleDesc",
  },
  "fuel-efficient": {
    label: "categories.fuelEfficient",
    desc: "categories.fuelEfficientDesc",
  },
};

interface DiscoveryCategoriesSectionProps {
  vehicles: Vehicle[];
}

export function DiscoveryCategoriesSection({
  vehicles,
}: DiscoveryCategoriesSectionProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const smartMatchCatalog = useSmartMatchRulesCatalog();

  const categories = useMemo(
    () =>
      CATEGORY_IDS.map((id) => ({
        id,
        label: t(CATEGORY_KEYS[id].label),
        desc: t(CATEGORY_KEYS[id].desc),
      })),
    [t],
  );

  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORY_IDS.map((c) => [
          c,
          countByCategory(vehicles, c, smartMatchCatalog),
        ]),
      ) as Record<LifestyleChoice, number>,
    [vehicles, smartMatchCatalog],
  );

  return (
    <section id="categories" className="scroll-mt-20 py-16 sm:py-24">
      <div className="portal-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              {t("categories.shopByLife")}
            </p>
            <h2 className="mt-4 headline-stack text-4xl sm:text-5xl">
              {t("categories.howDoYouDrive")}
            </h2>
            <p className="mt-4 text-[var(--muted)]">{t("categories.intro")}</p>
            <div className="mt-8 hidden lg:block">
              <DiscoveryCTA layout="stack" size="compact" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((cat, index) => {
              const count = counts[cat.id];
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    router.push(buildInventoryUrl(filtersFromShopByLife(cat.id)))
                  }
                  className={`${cardCategory} ${
                    index === 0 ? "sm:col-span-2 sm:min-h-[200px]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-3xl">
                      {cat.label}
                    </h3>
                    <span className="shrink-0 rounded-md border border-[var(--line-dark)] bg-[var(--cream)] px-2.5 py-1 text-xs font-bold text-[var(--muted)] group-hover:border-[var(--gold)] group-hover:text-[var(--ink)]">
                      {count > 0
                        ? t("categories.vehiclesCount", undefined, { count })
                        : t("categories.explore")}
                    </span>
                  </div>
                  <p className="mt-2 max-w-sm text-sm leading-snug text-[var(--muted)]">
                    {cat.desc}
                  </p>
                  <span className="mt-4 inline-flex text-sm font-semibold text-[var(--ink)]">
                    {t("categories.viewMatches")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex justify-center lg:hidden">
          <DiscoveryCTA />
        </div>
      </div>
    </section>
  );
}
