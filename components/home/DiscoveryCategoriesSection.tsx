"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { LifeCategoryCardVisual } from "@/components/home/LifeCategoryCardVisual";
import { countByCategory } from "@/lib/categoryCounts";
import { useSmartMatchRulesCatalog } from "@/components/providers/SmartMatchRulesProvider";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import {
  DEFAULT_INVENTORY_FILTERS,
  filtersToSearchParams,
} from "@/lib/inventorySearch";
import {
  filtersFromLifeCategory,
  LIFE_CATEGORIES,
  type LifeCategoryId,
} from "@/lib/lifeFilters";
import { cardCategory } from "@/lib/cardClasses";
import type { Vehicle } from "@/lib/types";

interface DiscoveryCategoriesSectionProps {
  vehicles: Vehicle[];
}

export function DiscoveryCategoriesSection({
  vehicles,
}: DiscoveryCategoriesSectionProps) {
  const router = useRouter();
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
              Shop by life
            </p>
            <h2 className="mt-4 headline-stack text-4xl sm:text-5xl">
              How do you drive?
            </h2>
            <p className="mt-4 text-[var(--muted)]">
              Choose the life you are shopping for — not a generic filter menu.
              We will surface vehicles that fit how you actually live.
            </p>
            <div className="mt-8 hidden lg:block">
              <DiscoveryCTA layout="stack" size="compact" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {LIFE_CATEGORIES.map((cat, index) => {
              const count = counts[cat.id];
              const featured = index === 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigateToCategory(cat.id)}
                  className={`${cardCategory} ${
                    featured ? "sm:col-span-2 sm:min-h-[200px]" : "min-h-[140px]"
                  }`}
                >
                  <LifeCategoryCardVisual
                    categoryId={cat.id}
                    imageUrl={cat.imageUrl}
                    featured={featured}
                  />

                  <div
                    className={`relative z-10 flex min-w-0 flex-col text-left ${
                      featured ? "pr-[42%] sm:pr-44" : "pr-[38%] sm:pr-36"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-3xl">
                        {cat.title}
                      </h3>
                      <span className="shrink-0 rounded-md border border-[var(--line-dark)] bg-[var(--cream)] px-2.5 py-1 text-xs font-bold text-[var(--muted)] group-hover:border-[var(--gold)] group-hover:text-[var(--ink)]">
                        {count > 0
                          ? `${count.toLocaleString()} vehicles`
                          : "Explore"}
                      </span>
                    </div>
                    <p className="mt-2 max-w-sm text-sm leading-snug text-[var(--muted)]">
                      {cat.description}
                    </p>
                    <span className="mt-4 inline-flex text-sm font-semibold text-[var(--ink)]">
                      {cat.ctaLabel} →
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
