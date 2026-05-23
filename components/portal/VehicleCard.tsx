"use client";



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

import type { Vehicle } from "@/lib/types";

import { btnCardPrimary, btnCardSecondary } from "@/lib/buttonClasses";

import {

  cardBodyCompact,

  cardImageTop,

  cardVehicle,

  cardVehicleRail,

} from "@/lib/cardClasses";



interface VehicleCardProps {

  vehicle: Vehicle;

  matchLabel?: string;

  matchReason?: string | null;

  variant?: "editorial" | "rail";

}



export function VehicleCard({

  vehicle,

  matchLabel,

  matchReason,

  variant = "rail",

}: VehicleCardProps) {

  const { openLead } = useLeadCapture();
  const availability = useCta("availability");
  const buildShortlist = useCta("build_my_shortlist");
  const compareSimilar = useCta("compare_similar");

  const title = formatVehicleTitle(vehicle);

  const label = formatVehicleLabel(vehicle);

  const detailHref = vehicleDetailPath(vehicle.id);

  const isRail = variant === "rail";



  return (

    <article className={isRail ? cardVehicleRail : cardVehicle}>

      <Link

        href={detailHref}

        className={`${cardImageTop} ${

          isRail ? "aspect-[5/4]" : "aspect-[16/10]"

        }`}

      >

        <VehicleImage

          vehicle={vehicle}

          placeholderSize={isRail ? "sm" : "lg"}

          className="h-full w-full object-cover"

        />

        {matchLabel ? (

          <span className="absolute left-3 top-3 rounded-md bg-[var(--ink)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">

            {matchLabel}

          </span>

        ) : null}

      </Link>



      <div className={cardBodyCompact}>

        <Link href={detailHref} className="block transition hover:opacity-80">

          <h3 className="text-base font-semibold leading-snug text-[var(--ink)]">

            {title}

          </h3>

          {vehicle.trim ? (

            <p className="text-xs text-[var(--muted)] line-clamp-1">

              {vehicle.trim}

            </p>

          ) : null}

        </Link>

        <div className="mt-2 flex items-baseline justify-between gap-2">

          <p className="text-lg font-semibold leading-none text-[var(--ink)]">

            {formatVehiclePrice(vehicle)}

          </p>

          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">

            #{vehicle.stock_number ?? "—"}

          </p>

        </div>

        {matchReason ? (
          <p className="mt-2 text-xs leading-snug text-[var(--muted)] line-clamp-2">
            {matchReason}
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-2">

          <button

            type="button"

            onClick={() =>

              openLead({

                action: "availability",

                vehicle,

                shopperIntent: `Check availability for ${label}`,

              })

            }

            className={btnCardPrimary}

          >

            {availability.label}

          </button>

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

            {buildShortlist.label}

          </button>

          <button

            type="button"

            onClick={() =>

              openLead({

                action: "compare",

                vehicle,

                shopperIntent: `Find similar to ${label}`,

              })

            }

            className={btnCardSecondary}

          >

            {compareSimilar.label}

          </button>

        </div>

      </div>

    </article>

  );

}


