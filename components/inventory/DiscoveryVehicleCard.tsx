"use client";

import Link from "next/link";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import {
  formatPrice,
  formatVehicleLabel,
  formatVehicleTitle,
  vehicleDetailPath,
} from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { getVehicleImageUrl } from "@/lib/vehicleImage";

interface DiscoveryVehicleCardProps {
  vehicle: Vehicle;
  matchLabel?: string;
  microcopy: string;
}

export function DiscoveryVehicleCard({
  vehicle,
  matchLabel,
  microcopy,
}: DiscoveryVehicleCardProps) {
  const { openLead } = useLeadCapture();
  const title = formatVehicleTitle(vehicle);
  const label = formatVehicleLabel(vehicle);
  const detailHref = vehicleDetailPath(vehicle.id);
  const hasPhoto = Boolean(getVehicleImageUrl(vehicle));

  const meta = [vehicle.year, vehicle.body_style, vehicle.condition]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-black/[0.05] transition duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(12,12,12,0.12)]">
      <Link
        href={detailHref}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <VehicleImage
          vehicle={vehicle}
          placeholderSize="lg"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        {hasPhoto ? (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ink)]/45 via-[var(--ink)]/5 to-transparent" />
        ) : null}
        {matchLabel ? (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] shadow-sm backdrop-blur-sm">
            {matchLabel}
          </span>
        ) : null}
        {hasPhoto && meta ? (
          <p className="absolute bottom-4 left-4 text-xs text-white/90">{meta}</p>
        ) : null}
      </Link>

      <div className="flex flex-col p-5 sm:p-6">
        <Link href={detailHref} className="block transition hover:opacity-85">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-[var(--ink)]">
            {title}
          </h3>
          {vehicle.trim ? (
            <p className="mt-1 truncate text-sm text-[var(--muted)]">
              {vehicle.trim}
            </p>
          ) : null}
          {!hasPhoto && meta ? (
            <p className="mt-1.5 text-xs text-[var(--muted)]">{meta}</p>
          ) : null}
          <p className="mt-2 text-sm italic text-[var(--muted)]">{microcopy}</p>
        </Link>
        <p className="mt-4 text-xl font-semibold tracking-tight text-[var(--ink)]">
          {formatPrice(vehicle.internet_price)}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Link
            href={detailHref}
            className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[var(--charcoal)]"
          >
            View details
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
              className="flex-1 rounded-full border border-[var(--line-dark)] px-3 py-2 text-[11px] font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              Shortlist
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
              className="flex-1 rounded-full border border-[var(--line-dark)] px-3 py-2 text-[11px] font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              Check availability
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
