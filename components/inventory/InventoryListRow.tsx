"use client";



import Link from "next/link";

import { useCta } from "@/components/cta/CtaProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";

import { VehicleImage } from "@/components/vehicle/VehicleImage";

import {

  formatPrice,

  formatVehicleLabel,

  formatVehicleTitle,

  vehicleDetailPath,

} from "@/lib/format";

import { btnCardPrimary, btnCardSecondary } from "@/lib/buttonClasses";

import { cardListImage, cardListRow } from "@/lib/cardClasses";

import type { Vehicle } from "@/lib/types";



interface InventoryListRowProps {

  vehicle: Vehicle;

  matchLabel?: string;

  microcopy: string;

}



export function InventoryListRow({

  vehicle,

  matchLabel,

  microcopy,

}: InventoryListRowProps) {

  const { openLead } = useLeadCapture();
  const detailsLink = useCta("details_link");
  const saveShortlist = useCta("save_shortlist");
  const checkCompact = useCta("check_compact");

  const title = formatVehicleTitle(vehicle);

  const label = formatVehicleLabel(vehicle);

  const detailHref = vehicleDetailPath(vehicle.id);



  const meta = [vehicle.body_style, vehicle.condition]

    .filter(Boolean)

    .join(" · ");



  return (

    <article className={cardListRow}>

      <Link href={detailHref} className={cardListImage}>

        <VehicleImage

          vehicle={vehicle}

          placeholderSize="sm"

          className="h-full w-full object-cover"

        />

        {matchLabel ? (

          <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--ink)]">

            {matchLabel}

          </span>

        ) : null}

      </Link>



      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">

        <Link href={detailHref} className="block">

          <h3 className="text-base font-semibold leading-snug tracking-tight text-[var(--ink)] sm:text-lg">

            {title}

          </h3>

          {vehicle.trim ? (

            <p className="truncate text-sm text-[var(--muted)]">{vehicle.trim}</p>

          ) : null}

        </Link>

        {meta ? <p className="text-xs text-[var(--muted)]">{meta}</p> : null}

        <p className="text-xs text-[var(--muted)]">{microcopy}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-0.5">

          <p className="text-lg font-semibold leading-none text-[var(--ink)]">

            {formatPrice(vehicle.internet_price)}

          </p>

          {vehicle.stock_number ? (

            <p className="text-xs text-[var(--muted)]">

              #{vehicle.stock_number}

            </p>

          ) : null}

        </div>

      </div>



      <div className="flex shrink-0 flex-col justify-center gap-2 sm:w-40">

        <Link href={detailHref} className={btnCardPrimary}>

          {detailsLink.label}

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

            {saveShortlist.label}

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

            {checkCompact.label}

          </button>

        </div>

      </div>

    </article>

  );

}


