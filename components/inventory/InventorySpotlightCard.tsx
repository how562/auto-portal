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

interface InventorySpotlightCardProps {
  vehicle: Vehicle;
  matchLabel?: string;
  microcopy: string;
}

export function InventorySpotlightCard({
  vehicle,
  matchLabel,
  microcopy,
}: InventorySpotlightCardProps) {
  const { openLead } = useLeadCapture();
  const title = formatVehicleTitle(vehicle);
  const label = formatVehicleLabel(vehicle);
  const detailHref = vehicleDetailPath(vehicle.id);
  const hasPhoto = Boolean(getVehicleImageUrl(vehicle));

  const meta = [vehicle.year, vehicle.body_style, vehicle.condition]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="overflow-hidden rounded-[2rem] bg-white ring-1 ring-black/[0.05] shadow-[0_12px_48px_rgba(12,12,12,0.08)]">
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
          {hasPhoto ? (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--ink)]/50 via-transparent to-transparent" />
          ) : null}
          {matchLabel ? (
            <span className="absolute left-5 top-5 rounded-full bg-white/95 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink)] shadow-sm backdrop-blur-sm">
              Top match · {matchLabel}
            </span>
          ) : (
            <span className="absolute left-5 top-5 rounded-full bg-[var(--gold)]/90 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Top match
            </span>
          )}
        </Link>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Spotlight
          </p>
          <Link href={detailHref} className="mt-3 block group">
            <h2 className="headline-stack text-3xl transition group-hover:opacity-85 sm:text-4xl">
              {title}
            </h2>
            {vehicle.trim ? (
              <p className="mt-2 text-sm text-[var(--muted)]">{vehicle.trim}</p>
            ) : null}
          </Link>
          {meta ? (
            <p className="mt-3 text-sm text-[var(--muted)]">{meta}</p>
          ) : null}
          <p className="mt-3 text-sm italic text-[var(--muted)]">{microcopy}</p>
          <p className="mt-5 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            {formatPrice(vehicle.internet_price)}
          </p>
          {vehicle.stock_number ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Stock #{vehicle.stock_number}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href={detailHref}
              className="rounded-full bg-[var(--ink)] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--charcoal)]"
            >
              View details
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
              className="rounded-full border border-[var(--line-dark)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
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
              className="rounded-full border border-[var(--line-dark)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              Check availability
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
