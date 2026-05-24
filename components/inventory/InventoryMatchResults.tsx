"use client";

import { useCallback } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { DiscoveryVehicleCard } from "@/components/inventory/DiscoveryVehicleCard";
import { FeaturedPicksStrip } from "@/components/inventory/FeaturedPicksStrip";
import { InventoryConfidenceBand } from "@/components/inventory/InventoryConfidenceBand";
import { InventoryListRow } from "@/components/inventory/InventoryListRow";
import { InventorySpotlightCard } from "@/components/inventory/InventorySpotlightCard";
import {
  getVehicleMatchLabel,
  getVehicleMicrocopy,
  pickFeaturedVehicles,
  pickSpotlightVehicle,
} from "@/lib/inventoryDiscovery";
import type { InventoryViewMode } from "@/lib/inventoryView";
import type { InventoryFilters } from "@/lib/inventorySearch";
import type { Vehicle } from "@/lib/types";

interface InventoryMatchResultsProps {
  vehicles: Vehicle[];
  totalCount: number;
  page: number;
  totalPages: number;
  buildPageHref: (page: number) => string;
  filters: InventoryFilters;
  viewMode: InventoryViewMode;
}

export function InventoryMatchResults({
  vehicles,
  page,
  totalPages,
  buildPageHref,
  filters,
  viewMode,
}: InventoryMatchResultsProps) {
  const { t, locale } = useLanguage();

  const microcopyFor = useCallback(
    (v: Vehicle) => getVehicleMicrocopy(v, filters, locale),
    [filters, locale],
  );
  const matchLabelFor = useCallback(
    (v: Vehicle) => getVehicleMatchLabel(v, filters, t, locale),
    [filters, t, locale],
  );

  const spotlight = pickSpotlightVehicle(vehicles);
  const rest = spotlight
    ? vehicles.filter((v) => v.id !== spotlight.id)
    : vehicles;
  const featured =
    vehicles.length >= 3 ? pickFeaturedVehicles(rest, 2) : [];
  const showFeaturedStrip = featured.length > 0;

  return (
    <section aria-label={t("inventory.results.yourMatches")} className="mt-2">
      <div className="space-y-6 sm:space-y-8">
        {spotlight ? (
          <InventorySpotlightCard
            vehicle={spotlight}
            matchLabel={matchLabelFor(spotlight)}
            microcopy={microcopyFor(spotlight)}
          />
        ) : null}

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
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
          <div className="flex flex-col gap-2.5">
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
