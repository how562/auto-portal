"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActiveFilterChips } from "@/components/inventory/ActiveFilterChips";
import { GuidedRefinement } from "@/components/inventory/GuidedRefinement";
import { InventoryMatchResults } from "@/components/inventory/InventoryMatchResults";
import { InventoryMoreFiltersDrawer } from "@/components/inventory/InventoryMoreFiltersDrawer";
import { InventoryQuickFilters } from "@/components/inventory/InventoryQuickFilters";
import { PortalHeader } from "@/components/layout/PortalHeader";
import {
  countMoreFilters,
  getActiveFilterChips,
} from "@/lib/inventoryDiscovery";
import {
  DEFAULT_INVENTORY_FILTERS,
  buildInventorySubtitle,
  filterInventoryVehicles,
  filtersToSearchParams,
  getRefinementSuggestions,
  searchParamsToFilters,
  type InventoryFilters,
} from "@/lib/inventorySearch";
import type { Store, Vehicle } from "@/lib/types";

interface InventoryPageClientProps {
  vehicles: Vehicle[];
  stores: Store[];
  loadError: string | null;
}

export function InventoryPageClient({
  vehicles,
  stores,
  loadError,
}: InventoryPageClientProps) {
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

  const syncUrl = useCallback(
    (next: InventoryFilters) => {
      const params = filtersToSearchParams(next);
      const qs = params.toString();
      router.replace(qs ? `/inventory?${qs}` : "/inventory", { scroll: false });
    },
    [router],
  );

  const updateFilters = useCallback(
    (patch: Partial<InventoryFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch };
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

  const results = useMemo(
    () => filterInventoryVehicles(vehicles, filters),
    [vehicles, filters],
  );

  const subtitle = buildInventorySubtitle(filters);
  const suggestions = getRefinementSuggestions(filters);
  const activeChips = getActiveFilterChips(filters, stores);
  const moreFilterCount = countMoreFilters(filters);

  return (
    <>
      <PortalHeader />
      <div className="min-h-screen bg-[var(--cream)] pt-20 sm:pt-24">
        <div className="portal-container py-10 sm:py-14">
          <header className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              Guided discovery
            </p>
            <h1 className="mt-3 headline-stack text-4xl sm:text-5xl lg:text-[3.25rem]">
              Find your match
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[var(--muted)]">
              {subtitle}
            </p>
          </header>

          <div className="mt-10 space-y-5">
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
            <p className="mt-12 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
              {loadError}
            </p>
          ) : null}

          {!loadError && results.length === 0 ? (
            <div className="mt-14 rounded-[2rem] border border-dashed border-[var(--line-dark)] bg-white px-8 py-20 text-center">
              <p className="text-lg font-semibold text-[var(--ink)]">
                No matches on this path yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                Try a refinement suggestion above or open more filters—we&apos;ll
                surface more options across the group.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-8 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
              >
                Reset discovery
              </button>
            </div>
          ) : null}

          {!loadError && results.length > 0 ? (
            <InventoryMatchResults
              vehicles={results}
              filters={filters}
              onSortChange={(sort) => updateFilters({ sort })}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
