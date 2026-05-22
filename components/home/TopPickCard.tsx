"use client";

import Link from "next/link";
import { useCta } from "@/components/cta/CtaProvider";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import {
  formatPrice,
  formatVehicleTitle,
  vehicleDetailPath,
} from "@/lib/format";
import { btnCardPrimary } from "@/lib/buttonClasses";
import { cardBodyCompact, cardImageTop, cardVehicle } from "@/lib/cardClasses";
import type { TopPickCardData } from "@/lib/topPicksTypes";

interface TopPickCardProps {
  pick: TopPickCardData;
}

export function TopPickCard({ pick }: TopPickCardProps) {
  const viewDetails = useCta("view_details");
  const { vehicle, recommendationLabel, whyItFits } = pick;
  const title = formatVehicleTitle(vehicle);
  const detailHref = vehicleDetailPath(vehicle.id);

  return (
    <article className={cardVehicle}>
      <Link href={detailHref} className={`${cardImageTop} aspect-[4/3]`}>
        <VehicleImage
          vehicle={vehicle}
          placeholderSize="lg"
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-md bg-[var(--ink)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {recommendationLabel}
        </span>
      </Link>

      <div className={cardBodyCompact}>
        <Link href={detailHref} className="block transition hover:opacity-85">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-[var(--ink)]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-snug text-[var(--muted)]">
            {whyItFits}
          </p>
        </Link>

        <p className="mt-3 text-xl font-semibold leading-none tracking-tight text-[var(--ink)]">
          {formatPrice(vehicle.internet_price)}
        </p>

        <div className="mt-4">
          <Link href={detailHref} className={`${btnCardPrimary} w-full`}>
            {viewDetails.label}
          </Link>
        </div>
      </div>
    </article>
  );
}
