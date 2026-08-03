"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ActiveFilterChips } from "@/components/inventory/ActiveFilterChips";
import { GuidedRefinement } from "@/components/inventory/GuidedRefinement";
import { InventoryCampaignBanner } from "@/components/inventory/InventoryCampaignBanner";
import { InventoryCommandIntro } from "@/components/inventory/InventoryCommandIntro";
import { InventoryMatchResults } from "@/components/inventory/InventoryMatchResults";
import { InventoryMissionControl } from "@/components/inventory/InventoryMissionControl";
import { InventoryMoreFiltersDrawer } from "@/components/inventory/InventoryMoreFiltersDrawer";
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
  filterInventoryVehiclesWithMeta,
  filterVehiclesByKeywordSearch,
  filtersToSearchParams,
  getLifeCategoryHeader,
  getLifeEmptyStateCopy,
  getLifeRefinementChips,
  getRefinementSuggestions,
  paginateInventoryResults,
  INVENTORY_PAGE_SIZE,
  type InventoryFilters,
} from "@/lib/inventorySearch";
import {
  applyInventoryPagePreset,
  type InventoryPagePreset,
} from "@/lib/inventorySitePages";
import type { InventoryViewMode } from "@/lib/inventoryView";
import { getStoredViewMode, storeViewMode } from "@/lib/inventoryView";
import type { Store, Vehicle } from "@/lib/types";

interface InventoryPageClientProps {
  vehicles: Vehicle[];
  stores: Store[];
  initialFilters: InventoryFilters;
  initialSearchQuery?: string | null;
  loadError: string | null;
  page: number;
  totalCount: number;
  serverPaginated: boolean;
  /** Optional CMS banner — omit to collapse the slot. */
  bannerImageUrl?: string | null;
  /** Defaults to `/inventory`. Use `/${slug}` for inventory listing pages. */
  basePath?: string;
  /** Page H1 for inventory landing pages. */
  pageTitle?: string;
  /** Locked filter dimensions from CMS inventory_preset. */
  lockedPreset?: InventoryPagePreset;
  /** Filters restored by “reset” on landing pages (preset defaults). */
  resetFilters?: InventoryFilters;
  audienceByStoreId?: Record<string, string>;
}

function applyMakeModelFilter(
  items: Vehicle[],
  makeFilter: string,
  modelFilter: string,
): Vehicle[] {
  let result = items;
  if (makeFilter !== "all") {
    result = result.filter((vehicle) => vehicle.make === makeFilter);
  }
  if (modelFilter !== "all") {
    result = result.filter((vehicle) => vehicle.model === modelFilter);
  }
  return result;
}

export function InventoryPageClient({
  vehicles,
  stores,
  initialFilters,
  initialSearchQuery = null,
  loadError,
  page,
  totalCount,
  serverPaginated,
  bannerImageUrl = null,
  basePath = "/inventory",
  pageTitle,
  lockedPreset,
  resetFilters: resetFiltersProp,
  audienceByStoreId = {},
}: InventoryPageClientProps) {
  const { t, locale } = useLanguage();
  const smartMatchCatalog = useSmartMatchRulesCatalog();
  const router = useRouter();
  const resetFilters = resetFiltersProp ?? DEFAULT_INVENTORY_FILTERS;

  const enforcePreset = useCallback(
    (next: InventoryFilters) =>
      lockedPreset ? applyInventoryPagePreset(next, lockedPreset) : next,
    [lockedPreset],
  );
  const [filters, setFilters] = useState<InventoryFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);
  const [makeFilter, setMakeFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [viewMode, setViewMode] = useState<InventoryViewMode>("grid");

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  useEffect(() => {
    setViewMode(getStoredViewMode());
  }, []);

  const currentPage = page;

  const syncUrl = useCallback(
    (next: InventoryFilters, nextPage = 1, nextSearch = searchQuery) => {
      const applied = enforcePreset(next);
      const params = filtersToSearchParams(applied, nextPage, nextSearch);
      const qs = params.toString();
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false });
    },
    [router, searchQuery, basePath, enforcePreset],
  );

  const updateFilters = useCallback(
    (patch: Partial<InventoryFilters>) => {
      setFilters((prev) => {
        const next = enforcePreset({
          ...prev,
          ...patch,
          ...(patch.lifestyle != null && patch.lifestyle !== prev.lifestyle
            ? { lifeRefinement: null }
            : {}),
        });
        syncUrl(next);
        return next;
      });
    },
    [syncUrl, enforcePreset],
  );

  const applyFilterPatch = useCallback(
    (patch: Partial<InventoryFilters>) => {
      updateFilters(patch);
    },
    [updateFilters],
  );

  const clearAll = useCallback(() => {
    setFilters(resetFilters);
    setSearchQuery(null);
    setMakeFilter("all");
    setModelFilter("all");
    syncUrl(resetFilters, 1, null);
  }, [syncUrl, resetFilters]);

  const handleMakeChange = useCallback((make: string) => {
    setMakeFilter(make);
    setModelFilter("all");
  }, []);

  const handleViewMode = useCallback((mode: InventoryViewMode) => {
    setViewMode(mode);
    storeViewMode(mode);
  }, []);

  const { filteredVehicles, similarPicks } = useMemo(() => {
    if (serverPaginated) {
      return { filteredVehicles: vehicles, similarPicks: false };
    }
    const { vehicles: filtered, meta } = filterInventoryVehiclesWithMeta(
      vehicles,
      filters,
      smartMatchCatalog,
    );
    return { filteredVehicles: filtered, similarPicks: meta.similarPicks };
  }, [vehicles, filters, smartMatchCatalog, serverPaginated]);

  const makeModelFiltered = useMemo(
    () => applyMakeModelFilter(filteredVehicles, makeFilter, modelFilter),
    [filteredVehicles, makeFilter, modelFilter],
  );

  const searchFiltered = useMemo(
    () => filterVehiclesByKeywordSearch(makeModelFiltered, searchQuery),
    [makeModelFiltered, searchQuery],
  );

  const pagedResults = useMemo(() => {
    if (serverPaginated) {
      const items = filterVehiclesByKeywordSearch(
        applyMakeModelFilter(vehicles, makeFilter, modelFilter),
        searchQuery,
      );
      return {
        items,
        totalCount:
          makeFilter !== "all" ||
          modelFilter !== "all" ||
          searchQuery
            ? items.length
            : totalCount,
        page: currentPage,
        totalPages: Math.max(1, Math.ceil(totalCount / INVENTORY_PAGE_SIZE)),
      };
    }
    return paginateInventoryResults(searchFiltered, currentPage);
  }, [
    serverPaginated,
    vehicles,
    searchFiltered,
    totalCount,
    currentPage,
    makeFilter,
    modelFilter,
    searchQuery,
  ]);

  const buildPageHref = useCallback(
    (targetPage: number) => {
      const params = filtersToSearchParams(filters, targetPage, searchQuery);
      const qs = params.toString();
      return qs ? `${basePath}?${qs}` : basePath;
    },
    [filters, searchQuery, basePath],
  );

  const lifeHeader = useMemo(
    () => getLifeCategoryHeader(filters, locale),
    [filters, locale],
  );
  const lifeRefinementChips = useMemo(
    () => getLifeRefinementChips(filters, locale),
    [filters, locale],
  );
  const lifeEmptyState = useMemo(
    () => getLifeEmptyStateCopy(filters, locale),
    [filters, locale],
  );
  const suggestions = useMemo(
    () => getRefinementSuggestions(filters, t),
    [filters, t],
  );
  const activeChips = useMemo(
    () => getActiveFilterChips(filters, stores, t, locale),
    [filters, stores, t, locale],
  );
  const moreFilterCount = countMoreFilters(filters);

  const displayCount = pagedResults.totalCount;

  return (
    <>
      <PortalHeader />
      <div className="min-h-screen bg-[var(--cream)] pt-[4.75rem] sm:pt-20">
        <InventoryCampaignBanner imageUrl={bannerImageUrl} />

        <div className="portal-container space-y-4 pb-10 pt-3 sm:space-y-5 sm:pb-12 sm:pt-4">
          <InventoryCommandIntro
            vehicleCount={displayCount}
            lifeTitle={lifeHeader?.title ?? pageTitle ?? undefined}
            breadcrumbCurrentLabel={pageTitle}
          />

          <InventoryMissionControl
            filters={filters}
            vehicles={vehicles}
            makeFilter={makeFilter}
            modelFilter={modelFilter}
            moreFilterCount={moreFilterCount}
            viewMode={viewMode}
            onChange={updateFilters}
            onMakeChange={handleMakeChange}
            onModelChange={setModelFilter}
            onOpenMore={() => setMoreFiltersOpen(true)}
            onReset={clearAll}
            onSortChange={(sort) => updateFilters({ sort })}
            onViewModeChange={handleViewMode}
          />

          {(lifeRefinementChips.length > 0 ||
            activeChips.length > 0 ||
            suggestions.length > 0) && (
            <div className="space-y-3 rounded-lg border border-[var(--line)] bg-white px-3 py-3 shadow-tight sm:px-4">
              {lifeRefinementChips.length > 0 ? (
                <LifeRefinementChips
                  chips={lifeRefinementChips}
                  onApply={updateFilters}
                />
              ) : null}

              <ActiveFilterChips
                chips={activeChips}
                onRemove={applyFilterPatch}
                onClearAll={clearAll}
              />

              <GuidedRefinement
                suggestions={suggestions}
                onApply={updateFilters}
              />
            </div>
          )}

          <InventoryMoreFiltersDrawer
            open={moreFiltersOpen}
            onClose={() => setMoreFiltersOpen(false)}
            filters={filters}
            stores={stores}
            onChange={updateFilters}
          />

          {loadError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loadError}
            </p>
          ) : null}

          {!loadError && pagedResults.totalCount === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--line-dark)] bg-white px-6 py-14 text-center shadow-tight">
              <p className="text-lg font-semibold text-[var(--ink)]">
                {lifeEmptyState?.title ?? t("inventory.noMatchesTitle")}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                {lifeEmptyState?.body ?? t("inventory.noMatchesBody")}
              </p>
              <button
                type="button"
                onClick={clearAll}
                className={`mt-6 ${btnPrimaryMd}`}
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
              viewMode={viewMode}
              similarPicks={similarPicks}
              audienceKey={
                filters.storeId !== "all"
                  ? audienceByStoreId[filters.storeId] ?? null
                  : null
              }
              siteStoreId={
                filters.storeId !== "all" ? filters.storeId : null
              }
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
