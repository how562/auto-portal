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
  vehicleListingShellRow,
} from "@/components/vehicle/VehicleListingBlocks";
import type { VehicleHighlightBadge as BadgeKind } from "@/lib/matchReasons";
import { formatVehicleLabel, vehicleDetailPath } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { btnCardPrimary, btnCardSecondary } from "@/lib/buttonClasses";

interface InventoryListRowProps {
  vehicle: Vehicle;
  matchLabel?: string;
  matchChips?: string[];
  highlightBadge?: BadgeKind | null;
  highlightBadgeLabel?: string;
  microcopy: string;
  audienceKey?: string | null;
  siteStoreId?: string | null;
}

export function InventoryListRow({
  vehicle,
  matchLabel,
  matchChips,
  highlightBadge,
  highlightBadgeLabel,
  microcopy,
  audienceKey = null,
  siteStoreId = null,
}: InventoryListRowProps) {
  const { openLead } = useLeadCapture();
  const detailsLink = useCta("details_link");
  const saveShortlist = useCta("save_shortlist");
  const checkCompact = useCta("check_compact");

  const label = formatVehicleLabel(vehicle);
  const detailHref = vehicleDetailPath(vehicle.id, { audience: audienceKey });

  return (
    <article className={vehicleListingShellRow}>
      <VehicleListingImageLink
        vehicle={vehicle}
        href={detailHref}
        aspectClass="aspect-[16/10] w-full sm:aspect-auto sm:h-[7.75rem] sm:w-[12.4rem]"
        placeholderSize="sm"
        highlightBadge={highlightBadge}
        highlightBadgeLabel={highlightBadgeLabel}
        matchLabel={matchLabel}
        badgeClassName="left-2 top-2 px-2 py-0.5 text-[8px]"
        className="shrink-0 sm:rounded-md"
      />

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <VehicleListingHeading
          vehicle={vehicle}
          href={detailHref}
          size="sm"
          matchChips={matchChips}
          microcopy={matchChips?.length ? undefined : microcopy}
        />
        <VehicleListingPrice vehicle={vehicle} size="sm" />
        <VehicleListingMeta vehicle={vehicle} showDealer />
        <VehicleListingVin vehicle={vehicle} />
      </div>

      <div className="flex shrink-0 flex-col justify-center gap-2 sm:w-[9.5rem]">
        <Link href={detailHref} className={`${btnCardPrimary} w-full text-center`}>
          {detailsLink.label}
        </Link>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
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
            {saveShortlist.label}
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
            className={btnCardSecondary}
          >
            {checkCompact.label}
          </button>
        </div>
      </div>
    </article>
  );
}
