"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { DiscoveryVehicleCard } from "@/components/inventory/DiscoveryVehicleCard";
import { useSmartMatchRulesCatalog } from "@/components/providers/SmartMatchRulesProvider";
import {
  getHighlightBadgeLabel,
  getVehicleMatchPresentationForInventory,
} from "@/lib/matchReasons";
import { getVehicleMicrocopy } from "@/lib/inventoryDiscovery";
import {
  getSmartMatchResults,
  type InventoryMatchFilters,
} from "@/lib/inventoryMatch";
import { resolveBodyStyleCategories } from "@/lib/bodyStyleMatch";
import {
  searchParamsToFilters,
  toInventoryMatchFilters,
} from "@/lib/inventorySearch";
import { sortVehiclesByMerchandisingQuality } from "@/lib/vehicleQuality";
import type { Vehicle, VehicleDetail } from "@/lib/types";
import { btnSecondaryMd } from "@/lib/buttonClasses";

interface VdpSimilarVehiclesProps {
  vehicle: VehicleDetail;
  similar: Vehicle[];
}

function inferMatchFiltersFromVehicle(
  vehicle: VehicleDetail,
): InventoryMatchFilters {
  const categories = resolveBodyStyleCategories(vehicle.body_style ?? "", "");
  let body_style: InventoryMatchFilters["body_style"] = "any";
  if (categories.has("suv")) body_style = "suv";
  else if (categories.has("truck")) body_style = "truck";
  else if (categories.has("sedan")) body_style = "sedan";
  else if (categories.has("van")) body_style = "van";

  let condition: InventoryMatchFilters["condition"] = "any";
  const c = (vehicle.condition ?? "").toLowerCase();
  if (c === "new") condition = "new";
  else if (c.includes("cert") || c === "cpo") condition = "cpo";
  else if (c === "used") condition = "used";

  return {
    lifestyle: "any",
    budget: "any",
    condition,
    body_style,
    store_id: vehicle.store_id ?? undefined,
  };
}

export function VdpSimilarVehicles({
  vehicle,
  similar,
}: VdpSimilarVehiclesProps) {
  const { t, locale } = useLanguage();
  const catalog = useSmartMatchRulesCatalog();
  const searchParams = useSearchParams();

  const displayVehicles = useMemo(() => {
    const pool = similar.filter((v) => v.id !== vehicle.id);
    if (pool.length === 0) return [];

    const urlFilters = searchParamsToFilters(searchParams);
    const hasUrlFilters =
      urlFilters.lifestyle !== "all" ||
      urlFilters.budget !== "all" ||
      urlFilters.condition !== "all" ||
      urlFilters.bodyStyle !== "all";

    const matchFilters = hasUrlFilters
      ? toInventoryMatchFilters(urlFilters).matchFilters
      : inferMatchFiltersFromVehicle(vehicle);

    const smart = getSmartMatchResults(pool, matchFilters, catalog);
    const ordered =
      smart.vehicles.length > 0
        ? smart.vehicles
        : sortVehiclesByMerchandisingQuality(pool);

    return ordered.slice(0, 4);
  }, [similar, vehicle, searchParams, catalog]);

  if (displayVehicles.length === 0) return null;

  const inventoryFilters = searchParamsToFilters(searchParams);
  const sectionTitle = t(
    "vdp.similarYouMayLike",
    "Similar vehicles you may like",
  );
  return (
    <section aria-labelledby="vdp-similar-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="vdp-similar-heading"
            className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl"
          >
            {sectionTitle}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            {t(
              "vdp.similarYouMayLikeBody",
              "Curated from live group inventory—compare a few close matches without starting over.",
            )}
          </p>
        </div>
        <Link href="/inventory" className={`${btnSecondaryMd} shrink-0`}>
          {t("vdp.browseInventory", "Browse inventory")}
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {displayVehicles.map((v) => {
          const presentation = getVehicleMatchPresentationForInventory(
            v,
            inventoryFilters,
            catalog,
            locale,
          );
          return (
            <DiscoveryVehicleCard
              key={v.id}
              vehicle={v}
              matchChips={presentation.chips}
              highlightBadge={presentation.badge}
              highlightBadgeLabel={
                presentation.badge
                  ? getHighlightBadgeLabel(presentation.badge, locale)
                  : undefined
              }
              microcopy={getVehicleMicrocopy(v, inventoryFilters, locale)}
            />
          );
        })}
      </div>
    </section>
  );
}
