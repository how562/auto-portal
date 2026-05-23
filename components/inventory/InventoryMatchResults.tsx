"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { DiscoveryVehicleCard } from "@/components/inventory/DiscoveryVehicleCard";
import { FeaturedPicksStrip } from "@/components/inventory/FeaturedPicksStrip";
import { InventoryConfidenceBand } from "@/components/inventory/InventoryConfidenceBand";
import { InventoryListRow } from "@/components/inventory/InventoryListRow";
import { InventoryResultsToolbar } from "@/components/inventory/InventoryResultsToolbar";
import { InventorySpotlightCard } from "@/components/inventory/InventorySpotlightCard";
import {
  getVehicleMatchLabel,
  getVehicleMicrocopy,
  pickFeaturedVehicles,
  pickSpotlightVehicle,
} from "@/lib/inventoryDiscovery";
import type { InventoryViewMode } from "@/lib/inventoryView";
import { getStoredViewMode, storeViewMode } from "@/lib/inventoryView";
import type { InventoryFilters } from "@/lib/inventorySearch";
import type { Vehicle } from "@/lib/types";

interface InventoryMatchResultsProps {
  vehicles: Vehicle[];
  totalCount: number;
  page: number;
  totalPages: number;
  buildPageHref: (page: number) => string;
  filters: InventoryFilters;
  onSortChange: (sort: InventoryFilters["sort"]) => void;
}

export function InventoryMatchResults({
  vehicles,
  totalCount,
  page,
  totalPages,
  buildPageHref,
  filters,
  onSortChange,
}: InventoryMatchResultsProps) {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<InventoryViewMode>("grid");

  useEffect(() => {
    setViewMode(getStoredViewMode());
  }, []);

  const handleViewMode = useCallback((mode: InventoryViewMode) => {
    setViewMode(mode);
    storeViewMode(mode);
  }, []);

  const spotlight = pickSpotlightVehicle(vehicles);
  const rest = spotlight
    ? vehicles.filter((v) => v.id !== spotlight.id)
    : vehicles;
  const featured =
    vehicles.length >= 3 ? pickFeaturedVehicles(rest, 2) : [];
  const showFeaturedStrip = featured.length > 0;

  const microcopyFor = useCallback(
    (v: Vehicle) => getVehicleMicrocopy(v, filters),
    [filters],
  );
  const matchLabelFor = useCallback(
    (v: Vehicle) => getVehicleMatchLabel(v, filters, t),
    [filters, t],
  );

  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-6 max-w-2xl">
        <h2 className="headline-stack text-3xl sm:text-4xl">
          {t("inventory.results.yourMatches")}
        </h2>
        <p className="mt-3 text-[var(--muted)]">
          {t("inventory.results.spotlightIntro")}
        </p>
      </div>

      <InventoryResultsToolbar
        count={totalCount}
        sort={filters.sort}
        viewMode={viewMode}
        onSortChange={onSortChange}
        onViewModeChange={handleViewMode}
      />

      <div className="mt-8 space-y-12 sm:space-y-14">
        {spotlight ? (
          <InventorySpotlightCard
            vehicle={spotlight}
            matchLabel={matchLabelFor(spotlight)}
            microcopy={microcopyFor(spotlight)}
          />
        ) : null}

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-10 xl:grid-cols-3">
            {rest.map((vehicle) => (
              <DiscoveryVehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                matchLabel={matchLabelFor(vehicle)}
                microcopy={microcopyFor(vehicle)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rest.map((vehicle) => (
              <InventoryListRow
                key={vehicle.id}
                vehicle={vehicle}
                matchLabel={matchLabelFor(vehicle)}
                microcopy={microcopyFor(vehicle)}
              />
            ))}
          </div>
        )}

        {showFeaturedStrip ? (
          <FeaturedPicksStrip
            vehicles={featured}
            microcopyFor={microcopyFor}
          />
        ) : null}

        <InventoryConfidenceBand />
      </div>

      <InventoryPagination
        page={page}
        totalPages={totalPages}
        buildHref={buildPageHref}
      />
    </section>
  );
}
