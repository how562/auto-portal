"use client";

import Link from "next/link";
import { useCta } from "@/components/cta/CtaProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import {
  VehicleListingHeading,
  VehicleListingImageLink,
  VehicleListingMeta,
  VehicleListingPrice,
  VehicleListingVin,
  vehicleListingShell,
} from "@/components/vehicle/VehicleListingBlocks";
import type { VehicleHighlightBadge as BadgeKind } from "@/lib/matchReasons";
import { formatVehicleLabel, vehicleDetailPath } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface InventorySpotlightCardProps {
  vehicle: Vehicle;
  matchLabel?: string;
  matchChips?: string[];
  highlightBadge?: BadgeKind | null;
  highlightBadgeLabel?: string;
  microcopy: string;
  audienceKey?: string | null;
  siteStoreId?: string | null;
}

export function InventorySpotlightCard({
  vehicle,
  matchLabel,
  matchChips,
  highlightBadge,
  highlightBadgeLabel,
  microcopy,
  audienceKey = null,
  siteStoreId = null,
}: InventorySpotlightCardProps) {
  const { openLead } = useLeadCapture();
  const viewDetails = useCta("view_details");
  const shortlistCompact = useCta("shortlist_compact");
  const checkAvailability = useCta("check_availability");

  const label = formatVehicleLabel(vehicle);
  const detailHref = vehicleDetailPath(vehicle.id, { audience: audienceKey });

  return (
    <article
      className={`${vehicleListingShell} ring-1 ring-[var(--gold)]/20`}
    >
      <div className="grid lg:grid-cols-[1.12fr_1fr]">
        <VehicleListingImageLink
          vehicle={vehicle}
          href={detailHref}
          aspectClass="aspect-[16/10] lg:aspect-auto lg:min-h-[22rem]"
          placeholderSize="hero"
          fetchPriority="high"
          highlightBadge={highlightBadge}
          highlightBadgeLabel={highlightBadgeLabel}
          matchLabel={
            highlightBadge
              ? undefined
              : matchLabel
                ? `Top match · ${matchLabel}`
                : "Top match"
          }
          badgeClassName="left-4 top-4 px-3 py-1"
        />

        <div className="flex flex-col justify-center gap-3 p-5 sm:p-6 lg:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
            Spotlight
          </p>

          <VehicleListingHeading
            vehicle={vehicle}
            href={detailHref}
            size="lg"
            matchChips={matchChips}
            microcopy={matchChips?.length ? undefined : microcopy}
          />

          <VehicleListingPrice vehicle={vehicle} size="lg" className="mt-1" />
          <VehicleListingMeta vehicle={vehicle} showDealer />
          <VehicleListingVin vehicle={vehicle} />

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href={detailHref}
              className={`${btnPrimaryMd} w-full text-center sm:w-auto`}
            >
              {viewDetails.label}
            </Link>
            <button
              type="button"
              onClick={() =>
                openLead({
                  action: "shortlist",
                  vehicle,
                  storeId: siteStoreId,
                  shopperIntent: `Add to shortlist: ${label}`,
                })
              }
              className={`${btnSecondaryMd} w-full sm:w-auto`}
            >
              {shortlistCompact.label}
            </button>
            <button
              type="button"
              onClick={() =>
                openLead({
                  action: "availability",
                  vehicle,
                  storeId: siteStoreId,
                  shopperIntent: `Check availability for ${label}`,
                })
              }
              className={`${btnSecondaryMd} w-full sm:w-auto`}
            >
              {checkAvailability.label}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
