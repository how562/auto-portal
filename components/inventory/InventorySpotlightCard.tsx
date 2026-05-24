"use client";



import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

import { cardBody, cardOverflow } from "@/lib/cardClasses";



import Link from "next/link";

import { useCta } from "@/components/cta/CtaProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";

import { VehicleImage } from "@/components/vehicle/VehicleImage";

import {

  formatVehicleLabel,

  formatVehiclePrice,

  formatVehicleTitle,

  vehicleDetailPath,

} from "@/lib/format";

import { MatchReasonChips } from "@/components/match/MatchReasonChips";
import { VehicleHighlightBadge } from "@/components/match/VehicleHighlightBadge";
import type { VehicleHighlightBadge as BadgeKind } from "@/lib/matchReasons";
import type { Vehicle } from "@/lib/types";



interface InventorySpotlightCardProps {

  vehicle: Vehicle;

  matchLabel?: string;

  matchChips?: string[];

  highlightBadge?: BadgeKind | null;

  highlightBadgeLabel?: string;

  microcopy: string;

}



export function InventorySpotlightCard({

  vehicle,

  matchLabel,

  matchChips,

  highlightBadge,

  highlightBadgeLabel,

  microcopy,

}: InventorySpotlightCardProps) {

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



  return (

    <article className={cardOverflow}>

      <div className="grid lg:grid-cols-[1.15fr_1fr]">

        <Link

          href={detailHref}

          className="relative block aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[320px]"

        >

          <VehicleImage

            vehicle={vehicle}

            placeholderSize="hero"

            fetchPriority="high"

            className="h-full w-full object-cover"

          />

          {highlightBadge && highlightBadgeLabel ? (
            <VehicleHighlightBadge
              badge={highlightBadge}
              label={highlightBadgeLabel}
              className="left-4 top-4 px-3 py-1"
            />
          ) : (
            <span className="absolute left-4 top-4 rounded-md bg-[var(--gold)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {matchLabel ? `Top match · ${matchLabel}` : "Top match"}
            </span>
          )}

        </Link>



        <div className={`${cardBody} justify-center lg:p-8`}>

          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">

            Spotlight

          </p>

          <Link href={detailHref} className="mt-2 block group">

            <h2 className="headline-stack text-3xl transition group-hover:opacity-85 sm:text-4xl">

              {title}

            </h2>

            {vehicle.trim ? (

              <p className="text-sm text-[var(--muted)]">{vehicle.trim}</p>

            ) : null}

          </Link>

          {meta ? <p className="text-sm text-[var(--muted)]">{meta}</p> : null}

          {matchChips && matchChips.length > 0 ? (
            <MatchReasonChips chips={matchChips} className="mt-1" />
          ) : (
            <p className="text-sm text-[var(--muted)]">{microcopy}</p>
          )}

          <p className="text-2xl font-semibold leading-none tracking-tight text-[var(--ink)] sm:text-3xl">

            {formatVehiclePrice(vehicle)}

          </p>

          {vehicle.stock_number || vehicle.dealer_name ? (

            <p className="text-xs text-[var(--muted)]">

              {[
                vehicle.stock_number ? `Stock #${vehicle.stock_number}` : null,
                vehicle.dealer_name,
              ]
                .filter(Boolean)
                .join(" · ")}

            </p>

          ) : null}

          {vehicle.vin ? (
            <p
              className="select-text font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]"
              title={vehicle.vin}
            >
              VIN {vehicle.vin}
            </p>
          ) : null}



          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">

            <Link

              href={detailHref}

              className={`${btnPrimaryMd} w-full sm:w-auto`}

            >

              {viewDetails.label}

            </Link>

            <button

              type="button"

              onClick={() =>

                openLead({

                  action: "shortlist",

                  vehicle,

                  shopperIntent: `Add to shortlist: ${label}`,

                })

              }

              className={btnSecondaryMd}

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

              className={btnSecondaryMd}

            >

              {checkAvailability.label}

            </button>

          </div>

        </div>

      </div>

    </article>

  );

}


