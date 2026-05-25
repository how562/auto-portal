"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { LifeCategoryCardVisual } from "@/components/home/LifeCategoryCardVisual";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { usePortalText } from "@/components/providers/TextSettingsProvider";
import { countByCategory } from "@/lib/categoryCounts";
import { useSmartMatchRulesCatalog } from "@/components/providers/SmartMatchRulesProvider";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import {
  DEFAULT_INVENTORY_FILTERS,
  filtersToSearchParams,
} from "@/lib/inventorySearch";
import {
  filtersFromLifeCategory,
  getLocalizedLifeCategory,
  LIFE_CATEGORIES,
  type LifeCategoryId,
} from "@/lib/lifeFilters";
import { cardCategory } from "@/lib/cardClasses";
import type { Vehicle } from "@/lib/types";

/** Shop by Life homepage display order (2-column grid, no featured span). */
const SHOP_BY_LIFE_ORDER: LifeCategoryId[] = [
  "family",
  "everyday-drive",
  "work",
  "luxury",
  "budget",
  "first-vehicle",
  "fuel-efficient",
  "weekend-ready",
];

interface DiscoveryCategoriesSectionProps {
  vehicles: Vehicle[];
}

export function DiscoveryCategoriesSection({
  vehicles,
}: DiscoveryCategoriesSectionProps) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const discoveryHeading = usePortalText(
    "discovery.heading",
    t("categories.howDoYouDrive"),
  );
  const smartMatchCatalog = useSmartMatchRulesCatalog();

  const counts = useMemo(
    () =>
      Object.fromEntries(
        LIFE_CATEGORIES.map((c) => [
          c.id,
          countByCategory(vehicles, c.id, smartMatchCatalog),
        ]),
      ) as Record<LifeCategoryId, number>,
    [vehicles, smartMatchCatalog],
  );

  const displayCategories = useMemo(() => {
    const byId = new Map(LIFE_CATEGORIES.map((c) => [c.id, c]));
    return SHOP_BY_LIFE_ORDER.map((id) => byId.get(id)).filter(
      (c): c is (typeof LIFE_CATEGORIES)[number] => c != null,
    );
  }, []);

  function navigateToCategory(categoryId: LifeCategoryId) {
    const patch = filtersFromLifeCategory(categoryId);
    const params = filtersToSearchParams({
      ...DEFAULT_INVENTORY_FILTERS,
      ...patch,
    });
    router.push(`/inventory?${params.toString()}`);
  }

  return (
    <section id="categories" className="scroll-mt-20 py-16 sm:py-24">
      <div className="portal-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              {t("categories.shopByLife")}
            </p>
            <h2 className="mt-4 headline-stack text-4xl sm:text-5xl">
              {discoveryHeading}
            </h2>
            <p className="mt-4 text-[var(--muted)]">
              {t("categories.lifeIntro")}
            </p>
            <div className="mt-8 hidden lg:block">
              <DiscoveryCTA layout="stack" size="compact" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {displayCategories.map((cat) => {
              const count = counts[cat.id];
              const localized = getLocalizedLifeCategory(cat, locale);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigateToCategory(cat.id)}
                  className={`${cardCategory} relative flex min-h-[148px] items-center sm:min-h-[160px]`}
                >
                  <LifeCategoryCardVisual
                    categoryId={cat.id}
                    imageUrl={cat.imageUrl}
                  />

                  <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-md border border-[var(--line-dark)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--muted)] shadow-sm group-hover:border-[var(--gold)] group-hover:text-[var(--ink)] sm:right-4 sm:top-4">
                    {count > 0
                      ? t("categories.vehiclesCount", undefined, {
                          count: count.toLocaleString(),
                        })
                      : t("categories.explore")}
                  </span>

                  <div className="relative z-10 flex w-[52%] min-w-0 flex-col justify-center pr-2 text-left sm:w-[50%] sm:pr-3">
                    <h3 className="text-2xl font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-3xl">
                      {localized.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-snug text-[var(--muted)]">
                      {localized.description}
                    </p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-[var(--ink)]">
                      {localized.cta} →
                    </span>
                  </div>
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
