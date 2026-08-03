"use client";

import Link from "next/link";
import { useCta } from "@/components/cta/CtaProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import {
  VehicleListingHeading,
  VehicleListingImageLink,
  VehicleListingMeta,
  VehicleListingPrice,
  vehicleListingShell,
  vehicleListingShellRail,
} from "@/components/vehicle/VehicleListingBlocks";
import type { VehicleHighlightBadge as BadgeKind } from "@/lib/matchReasons";
import { formatVehicleLabel, vehicleDetailPath } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { btnCardPrimary, btnCardSecondary } from "@/lib/buttonClasses";

interface VehicleCardProps {
  vehicle: Vehicle;
  matchLabel?: string;
  matchChips?: string[];
  highlightBadge?: BadgeKind | null;
  highlightBadgeLabel?: string;
  variant?: "editorial" | "rail";
  audienceKey?: string | null;
  siteStoreId?: string | null;
}

export function VehicleCard({
  vehicle,
  matchLabel,
  matchChips,
  highlightBadge,
  highlightBadgeLabel,
  variant = "rail",
  audienceKey = null,
  siteStoreId = null,
}: VehicleCardProps) {
  const { openLead } = useLeadCapture();
  const availability = useCta("availability");
  const buildShortlist = useCta("build_my_shortlist");
  const compareSimilar = useCta("compare_similar");
  const viewDetails = useCta("view_details");

  const label = formatVehicleLabel(vehicle);
  const detailHref = vehicleDetailPath(vehicle.id, { audience: audienceKey });
  const isRail = variant === "rail";

  return (
    <article className={isRail ? vehicleListingShellRail : vehicleListingShell}>
      <VehicleListingImageLink
        vehicle={vehicle}
        href={detailHref}
        aspectClass="aspect-[16/10]"
        placeholderSize={isRail ? "sm" : "lg"}
        highlightBadge={highlightBadge}
        highlightBadgeLabel={highlightBadgeLabel}
        matchLabel={matchLabel}
      />

      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <VehicleListingHeading
          vehicle={vehicle}
          href={detailHref}
          size="sm"
          matchChips={matchChips}
        />

        <VehicleListingPrice vehicle={vehicle} size="sm" />
        <VehicleListingMeta vehicle={vehicle} />

        <div className="mt-auto flex flex-col gap-2 pt-1">
          <Link href={detailHref} className={`${btnCardPrimary} w-full text-center`}>
            {viewDetails.label}
          </Link>
          <div className="grid grid-cols-2 gap-2">
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
              className={btnCardSecondary}
            >
              {availability.label}
            </button>
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
              className={btnCardSecondary}
            >
              {buildShortlist.label}
            </button>
          </div>
          <button
            type="button"
            onClick={() =>
              openLead({
                action: "compare",
                vehicle,
                storeId: siteStoreId,
                shopperIntent: `Find similar to ${label}`,
              })
            }
            className={`${btnCardSecondary} w-full`}
          >
            {compareSimilar.label}
          </button>
        </div>
      </div>
    </article>
  );
}
