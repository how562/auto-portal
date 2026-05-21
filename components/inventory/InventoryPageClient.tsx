"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { GuidedRefinement } from "@/components/inventory/GuidedRefinement";
import { InventoryFilterBar } from "@/components/inventory/InventoryFilterBar";
import { VehicleCard } from "@/components/portal/VehicleCard";
import {
  DEFAULT_INVENTORY_FILTERS,
  buildInventorySubtitle,
  filterInventoryVehicles,
  filtersToSearchParams,
  getRefinementSuggestions,
  getResultMatchLabel,
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

  const results = useMemo(
    () => filterInventoryVehicles(vehicles, filters),
    [vehicles, filters],
  );

  const subtitle = buildInventorySubtitle(filters);
  const matchLabel = getResultMatchLabel(filters);
  const suggestions = getRefinementSuggestions(filters);

  const hasActiveFilters =
    filters.condition !== "all" ||
    filters.budget !== "all" ||
    filters.bodyStyle !== "all" ||
    filters.lifestyle !== "all" ||
    filters.storeId !== "all";

  return (
    <>
      <PortalHeader />
      <div className="min-h-screen bg-[var(--cream)] pt-20 sm:pt-24">
        <div className="portal-container py-8 sm:py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
                Search results
              </p>
              <h1 className="mt-3 headline-stack text-4xl sm:text-5xl">
                Browse Vehicles
              </h1>
              <p className="mt-3 max-w-xl text-[var(--muted)]">{subtitle}</p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <p className="text-2xl font-semibold text-[var(--ink)]">
                {results.length}
                <span className="ml-2 text-sm font-normal text-[var(--muted)]">
                  {results.length === 1 ? "vehicle" : "vehicles"}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-[var(--muted)]">
                  Sort
                </label>
                <select
                  value={filters.sort}
                  onChange={(e) =>
                    updateFilters({
                      sort: e.target.value as InventoryFilters["sort"],
                    })
                  }
                  className="rounded-full border-0 bg-white px-4 py-2 text-sm font-medium ring-1 ring-[var(--line-dark)]"
                >
                  <option value="match">Best Match</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="newest">Newest</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <InventoryFilterBar
              filters={filters}
              stores={stores}
              onChange={updateFilters}
            />
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setFilters(DEFAULT_INVENTORY_FILTERS);
                syncUrl(DEFAULT_INVENTORY_FILTERS);
              }}
              className="mt-4 text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
            >
              Clear all filters
            </button>
          ) : null}

          <div className="mt-8">
            <GuidedRefinement
              suggestions={suggestions}
              onApply={updateFilters}
            />
          </div>

          {loadError ? (
            <p className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
              {loadError}
            </p>
          ) : null}

          {!loadError && results.length === 0 ? (
            <div className="mt-12 rounded-[2rem] border border-dashed border-[var(--line-dark)] bg-white px-8 py-20 text-center">
              <p className="text-lg font-semibold text-[var(--ink)]">
                No vehicles match this path yet
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                Try a refinement suggestion above or loosen your filters—we&apos;ll
                surface more options across the group.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilters(DEFAULT_INVENTORY_FILTERS);
                  syncUrl(DEFAULT_INVENTORY_FILTERS);
                }}
                className="mt-8 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
              >
                View all inventory
              </button>
            </div>
          ) : null}

          {!loadError && results.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  matchLabel={matchLabel ?? undefined}
                  variant="editorial"
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
