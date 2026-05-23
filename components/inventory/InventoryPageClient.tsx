"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActiveFilterChips } from "@/components/inventory/ActiveFilterChips";
import { GuidedRefinement } from "@/components/inventory/GuidedRefinement";
import { InventoryMatchResults } from "@/components/inventory/InventoryMatchResults";
import { InventoryMoreFiltersDrawer } from "@/components/inventory/InventoryMoreFiltersDrawer";
import { InventoryQuickFilters } from "@/components/inventory/InventoryQuickFilters";
import { LifeRefinementChips } from "@/components/inventory/LifeRefinementChips";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSmartMatchRulesCatalog } from "@/components/providers/SmartMatchRulesProvider";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { btnPrimaryMd } from "@/lib/buttonClasses";
import {
  countMoreFilters,
  getActiveFilterChips,
} from "@/lib/inventoryDiscovery";
import {
  DEFAULT_INVENTORY_FILTERS,
  buildInventorySubtitle,
  filterInventoryVehicles,
  filtersToSearchParams,
  getLifeCategoryHeader,
  getLifeEmptyStateCopy,
  getLifeRefinementChips,
  getRefinementSuggestions,
  paginateInventoryResults,
  parseInventoryPage,
  searchParamsToFilters,
  type InventoryFilters,
} from "@/lib/inventorySearch";
import { INVENTORY_PAGE_SIZE } from "@/lib/vehicles";
import type { Store, Vehicle } from "@/lib/types";

interface InventoryPageClientProps {
  vehicles: Vehicle[];
  stores: Store[];
  loadError: string | null;
  page: number;
  totalCount: number;
  serverPaginated: boolean;
}

export function InventoryPageClient({
  vehicles,
  stores,
  loadError,
  page,
  totalCount,
  serverPaginated,
}: InventoryPageClientProps) {
  const { t } = useLanguage();
  const smartMatchCatalog = useSmartMatchRulesCatalog();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilters = useMemo(
    () => searchParamsToFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [filters, setFilters] = useState<InventoryFilters>(initialFilters);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  useEffect(() => {
    setFilters(
      searchParamsToFilters(new URLSearchParams(searchParams.toString())),
    );
  }, [searchParams]);

  const currentPage = useMemo(
    () => parseInventoryPage(searchParams.get("page")) || page,
    [searchParams, page],
  );

  const syncUrl = useCallback(
    (next: InventoryFilters, nextPage = 1) => {
      const params = filtersToSearchParams(next, nextPage);
      const qs = params.toString();
      router.replace(qs ? `/inventory?${qs}` : "/inventory", { scroll: false });
    },
    [router],
  );

  const updateFilters = useCallback(
    (patch: Partial<InventoryFilters>) => {
      setFilters((prev) => {
        const next = {
          ...prev,
          ...patch,
          ...(patch.lifestyle != null && patch.lifestyle !== prev.lifestyle
            ? { lifeRefinement: null }
            : {}),
        };
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const applyFilterPatch = useCallback(
    (patch: Partial<InventoryFilters>) => {
      updateFilters(patch);
    },
    [updateFilters],
  );

  const clearAll = useCallback(() => {
    setFilters(DEFAULT_INVENTORY_FILTERS);
    syncUrl(DEFAULT_INVENTORY_FILTERS);
  }, [syncUrl]);

  const filteredResults = useMemo(() => {
    if (serverPaginated) return vehicles;
    return filterInventoryVehicles(vehicles, filters, smartMatchCatalog);
  }, [vehicles, filters, smartMatchCatalog, serverPaginated]);

  const pagedResults = useMemo(() => {
    if (serverPaginated) {
      return {
        items: vehicles,
        totalCount,
        page: currentPage,
        totalPages: Math.max(1, Math.ceil(totalCount / INVENTORY_PAGE_SIZE)),
      };
    }
    return paginateInventoryResults(filteredResults, currentPage);
  }, [
    serverPaginated,
    vehicles,
    filteredResults,
    totalCount,
    currentPage,
  ]);

  const buildPageHref = useCallback(
    (targetPage: number) => {
      const params = filtersToSearchParams(filters, targetPage);
      const qs = params.toString();
      return qs ? `/inventory?${qs}` : "/inventory";
    },
    [filters],
  );

  const subtitle = useMemo(
    () => buildInventorySubtitle(filters, t),
    [filters, t],
  );
  const lifeHeader = useMemo(() => getLifeCategoryHeader(filters), [filters]);
  const lifeRefinementChips = useMemo(
    () => getLifeRefinementChips(filters),
    [filters],
  );
  const lifeEmptyState = useMemo(() => getLifeEmptyStateCopy(filters), [filters]);
  const suggestions = useMemo(
    () => getRefinementSuggestions(filters, t),
    [filters, t],
  );
  const activeChips = useMemo(
    () => getActiveFilterChips(filters, stores, t),
    [filters, stores, t],
  );
  const moreFilterCount = countMoreFilters(filters);

  return (
    <>
      <PortalHeader />
      <div className="min-h-screen bg-[var(--cream)] pt-20 sm:pt-24">
        <div className="portal-container py-10 sm:py-14">
          <header className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              {t("inventory.guidedDiscovery")}
            </p>
            <h1 className="mt-3 headline-stack text-4xl sm:text-5xl lg:text-[3.25rem]">
              {lifeHeader?.title ?? t("inventory.findYourMatch")}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
              {lifeHeader?.subtitle ?? subtitle}
            </p>
          </header>

          <div className="mt-10 space-y-5">
            {lifeRefinementChips.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Refine your match
                </p>
                <LifeRefinementChips
                  chips={lifeRefinementChips}
                  onApply={updateFilters}
                />
              </div>
            ) : null}

            <ActiveFilterChips
              chips={activeChips}
              onRemove={applyFilterPatch}
              onClearAll={clearAll}
            />

            <InventoryQuickFilters
              filters={filters}
              onChange={updateFilters}
              onOpenMore={() => setMoreFiltersOpen(true)}
              moreFilterCount={moreFilterCount}
            />

            <GuidedRefinement
              suggestions={suggestions}
              onApply={updateFilters}
            />
          </div>

          <InventoryMoreFiltersDrawer
            open={moreFiltersOpen}
            onClose={() => setMoreFiltersOpen(false)}
            filters={filters}
            stores={stores}
            onChange={updateFilters}
          />

          {loadError ? (
            <p className="mt-12 rounded-md border border-red-200 bg-red-50 px-6 py-4 text-red-700">
              {loadError}
            </p>
          ) : null}

          {!loadError && pagedResults.totalCount === 0 ? (
            <div className="mt-14 rounded-md border border-dashed border-[var(--line-dark)] bg-white px-8 py-20 text-center">
              <p className="text-lg font-semibold text-[var(--ink)]">
                {lifeEmptyState?.title ?? t("inventory.noMatchesTitle")}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                {lifeEmptyState?.body ?? t("inventory.noMatchesBody")}
              </p>
              <button
                type="button"
                onClick={clearAll}
                className={`mt-8 ${btnPrimaryMd}`}
              >
                {t("inventory.resetDiscovery")}
              </button>
            </div>
          ) : null}

          {!loadError && pagedResults.totalCount > 0 ? (
            <InventoryMatchResults
              vehicles={pagedResults.items}
              totalCount={pagedResults.totalCount}
              page={pagedResults.page}
              totalPages={pagedResults.totalPages}
              buildPageHref={buildPageHref}
              filters={filters}
              onSortChange={(sort) => updateFilters({ sort })}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
