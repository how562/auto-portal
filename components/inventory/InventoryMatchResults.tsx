"use client";

import { useCallback, useMemo } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSmartMatchRulesCatalog } from "@/components/providers/SmartMatchRulesProvider";
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
import {
  getHighlightBadgeLabel,
  getSimilarPicksHeading,
  getVehicleMatchPresentationForInventory,
} from "@/lib/matchReasons";
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
  similarPicks?: boolean;
  audienceKey?: string | null;
  siteStoreId?: string | null;
}

export function InventoryMatchResults({
  vehicles,
  page,
  totalPages,
  buildPageHref,
  filters,
  viewMode,
  similarPicks = false,
  audienceKey = null,
  siteStoreId = null,
}: InventoryMatchResultsProps) {
  const { t, locale } = useLanguage();
  const smartMatchCatalog = useSmartMatchRulesCatalog();

  const microcopyFor = useCallback(
    (v: Vehicle) => getVehicleMicrocopy(v, filters, locale),
    [filters, locale],
  );
  const matchLabelFor = useCallback(
    (v: Vehicle) => getVehicleMatchLabel(v, filters, t, locale),
    [filters, t, locale],
  );

  const presentationFor = useCallback(
    (v: Vehicle) =>
      getVehicleMatchPresentationForInventory(
        v,
        filters,
        smartMatchCatalog,
        locale,
      ),
    [filters, smartMatchCatalog, locale],
  );

  const spotlight = pickSpotlightVehicle(vehicles);
  const rest = spotlight
    ? vehicles.filter((v) => v.id !== spotlight.id)
    : vehicles;
  const featured =
    vehicles.length >= 3 ? pickFeaturedVehicles(rest, 2) : [];
  const showFeaturedStrip = featured.length > 0;

  const spotlightPresentation = useMemo(
    () => (spotlight ? presentationFor(spotlight) : null),
    [spotlight, presentationFor],
  );

  const sectionLabel = similarPicks
    ? getSimilarPicksHeading(locale)
    : t("inventory.results.yourMatches");

  return (
    <section aria-label={sectionLabel} className="mt-2">
      {similarPicks ? (
        <p className="mb-4 text-sm text-[var(--muted)]">{sectionLabel}</p>
      ) : null}
      <div className="space-y-6 sm:space-y-8">
        {spotlight ? (
          <InventorySpotlightCard
            vehicle={spotlight}
            matchLabel={matchLabelFor(spotlight)}
            matchChips={spotlightPresentation?.chips}
            highlightBadge={spotlightPresentation?.badge}
            highlightBadgeLabel={
              spotlightPresentation?.badge
                ? getHighlightBadgeLabel(spotlightPresentation.badge, locale)
                : undefined
            }
            microcopy={microcopyFor(spotlight)}
            audienceKey={audienceKey}
            siteStoreId={siteStoreId}
          />
        ) : null}

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
            {rest.map((vehicle) => {
              const presentation = presentationFor(vehicle);
              return (
                <DiscoveryVehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  matchLabel={matchLabelFor(vehicle)}
                  matchChips={presentation.chips}
                  highlightBadge={presentation.badge}
                  highlightBadgeLabel={
                    presentation.badge
                      ? getHighlightBadgeLabel(presentation.badge, locale)
                      : undefined
                  }
                  microcopy={microcopyFor(vehicle)}
                  audienceKey={audienceKey}
                  siteStoreId={siteStoreId}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {rest.map((vehicle) => {
              const presentation = presentationFor(vehicle);
              return (
                <InventoryListRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  matchLabel={matchLabelFor(vehicle)}
                  matchChips={presentation.chips}
                  highlightBadge={presentation.badge}
                  highlightBadgeLabel={
                    presentation.badge
                      ? getHighlightBadgeLabel(presentation.badge, locale)
                      : undefined
                  }
                  microcopy={microcopyFor(vehicle)}
                  audienceKey={audienceKey}
                  siteStoreId={siteStoreId}
                />
              );
            })}
          </div>
        )}

        {showFeaturedStrip ? (
          <FeaturedPicksStrip
            vehicles={featured}
            microcopyFor={microcopyFor}
            audienceKey={audienceKey}
            siteStoreId={siteStoreId}
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
