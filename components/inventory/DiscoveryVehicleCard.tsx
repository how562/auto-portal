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
import { btnCardPrimary, btnCardSecondary } from "@/lib/buttonClasses";

interface DiscoveryVehicleCardProps {
  vehicle: Vehicle;
  matchLabel?: string;
  matchChips?: string[];
  highlightBadge?: BadgeKind | null;
  highlightBadgeLabel?: string;
  microcopy: string;
}

export function DiscoveryVehicleCard({
  vehicle,
  matchLabel,
  matchChips,
  highlightBadge,
  highlightBadgeLabel,
  microcopy,
}: DiscoveryVehicleCardProps) {
  const { openLead } = useLeadCapture();
  const viewDetails = useCta("view_details");
  const shortlistCompact = useCta("shortlist_compact");
  const checkAvailability = useCta("check_availability");

  const label = formatVehicleLabel(vehicle);
  const detailHref = vehicleDetailPath(vehicle.id);

  return (
    <article className={vehicleListingShell}>
      <VehicleListingImageLink
        vehicle={vehicle}
        href={detailHref}
        aspectClass="aspect-[16/10]"
        placeholderSize="lg"
        highlightBadge={highlightBadge}
        highlightBadgeLabel={highlightBadgeLabel}
        matchLabel={matchLabel}
      />

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <VehicleListingHeading
          vehicle={vehicle}
          href={detailHref}
          size="md"
          matchChips={matchChips}
          microcopy={matchChips?.length ? undefined : microcopy}
        />

        <VehicleListingPrice vehicle={vehicle} size="md" />
        <VehicleListingMeta vehicle={vehicle} showDealer />

        <VehicleListingVin vehicle={vehicle} className="mt-0.5" />

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <Link href={detailHref} className={`${btnCardPrimary} w-full text-center`}>
            {viewDetails.label}
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                openLead({
                  action: "shortlist",
                  vehicle,
                  shopperIntent: `Add to shortlist: ${label}`,
                })
              }
              className={btnCardSecondary}
            >
              {shortlistCompact.label}
            </button>
            <button
              type="button"
              onClick={() =>
                openLead({
                  action: "availability",
                  vehicle,
                  shopperIntent: `Check availability for ${label}`,
                })
              }
              className={btnCardSecondary}
            >
              {checkAvailability.label}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
