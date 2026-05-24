"use client";



import Link from "next/link";

import { useCta } from "@/components/cta/CtaProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";

import { VehicleImage } from "@/components/vehicle/VehicleImage";

import {

  formatMileage,
  formatVehicleLabel,

  formatVehiclePrice,

  formatVehicleTitle,

  vehicleDetailPath,

} from "@/lib/format";

import { btnCardPrimary, btnCardSecondary } from "@/lib/buttonClasses";

import {

  cardBodyCompact,

  cardImageTop,

  cardVehicle,

} from "@/lib/cardClasses";

import { MatchReasonChips } from "@/components/match/MatchReasonChips";
import { VehicleHighlightBadge } from "@/components/match/VehicleHighlightBadge";
import type { VehicleHighlightBadge as BadgeKind } from "@/lib/matchReasons";
import type { Vehicle } from "@/lib/types";



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

  const title = formatVehicleTitle(vehicle);

  const label = formatVehicleLabel(vehicle);

  const detailHref = vehicleDetailPath(vehicle.id);



  const meta = [vehicle.year, vehicle.body_style, vehicle.condition]

    .filter(Boolean)

    .join(" · ");

  const footnote = [
    vehicle.stock_number ? `#${vehicle.stock_number}` : null,
    vehicle.dealer_name,
  ]
    .filter(Boolean)
    .join(" · ");



  return (

    <article className={cardVehicle}>

      <Link href={detailHref} className={`${cardImageTop} aspect-[4/3]`}>

        <VehicleImage

          vehicle={vehicle}

          placeholderSize="lg"

          className="h-full w-full object-cover"

        />

        {highlightBadge && highlightBadgeLabel ? (
          <VehicleHighlightBadge
            badge={highlightBadge}
            label={highlightBadgeLabel}
          />
        ) : matchLabel ? (
          <span className="absolute left-3 top-3 rounded-md border border-[var(--line-dark)] bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]">
            {matchLabel}
          </span>
        ) : null}

        {meta ? (

          <p className="absolute bottom-3 left-3 rounded-md bg-[var(--ink)]/80 px-2 py-1 text-[11px] text-white">

            {meta}

          </p>

        ) : null}

      </Link>



      <div className={cardBodyCompact}>

        <Link href={detailHref} className="block transition hover:opacity-85">

          <h3 className="text-lg font-semibold leading-snug tracking-tight text-[var(--ink)]">

            {title}

          </h3>

          {vehicle.trim ? (

            <p className="truncate text-sm text-[var(--muted)]">{vehicle.trim}</p>

          ) : null}

          {matchChips && matchChips.length > 0 ? (
            <MatchReasonChips chips={matchChips} className="mt-1.5" />
          ) : (
            <p className="text-sm text-[var(--muted)]">{microcopy}</p>
          )}

        </Link>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-xl font-semibold leading-none tracking-tight text-[var(--ink)]">
            {formatVehiclePrice(vehicle)}
          </p>
          <p className="text-sm text-[var(--muted)]">
            {formatMileage(vehicle.mileage)}
          </p>
        </div>

        {footnote ? (
          <p className="text-xs text-[var(--muted)]">{footnote}</p>
        ) : null}

        {vehicle.vin ? (
          <p
            className="select-text font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]"
            title={vehicle.vin}
          >
            VIN {vehicle.vin}
          </p>
        ) : null}



        <div className="mt-3 flex flex-col gap-2">

          <Link href={detailHref} className={`${btnCardPrimary} w-full`}>

            {viewDetails.label}

          </Link>

          <div className="flex gap-2">

            <button

              type="button"

              onClick={() =>

                openLead({

                  action: "shortlist",

                  vehicle,

                  shopperIntent: `Add to shortlist: ${label}`,

                })

              }

              className={`flex-1 ${btnCardSecondary}`}

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

              className={`flex-1 ${btnCardSecondary}`}

            >

              {checkAvailability.label}

            </button>

          </div>

        </div>

      </div>

    </article>

  );

}


