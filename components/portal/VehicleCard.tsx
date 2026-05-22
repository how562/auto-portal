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

interface VehicleCardProps {
  vehicle: Vehicle;
  matchLabel?: string;
  variant?: "editorial" | "rail";
}

export function VehicleCard({
  vehicle,
  matchLabel,
  variant = "rail",
}: VehicleCardProps) {
  const { openLead } = useLeadCapture();
  const title = formatVehicleTitle(vehicle);
  const label = formatVehicleLabel(vehicle);
  const detailHref = vehicleDetailPath(vehicle.id);
  const isRail = variant === "rail";

  const btnPrimary =
    "rounded-full bg-[var(--ink)] px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[var(--charcoal)]";
  const btnSecondary =
    "rounded-full border border-[var(--line-dark)] px-3 py-2 text-[11px] font-semibold text-[var(--ink)] transition hover:bg-[var(--cream)]";

  return (
    <article
      className={`group flex flex-col overflow-hidden bg-white hover-lift ${
        isRail
          ? "rail-card w-[min(82vw,300px)] rounded-[1.75rem] ring-1 ring-black/[0.05]"
          : "rounded-[1.75rem] ring-1 ring-black/[0.05]"
      }`}
    >
      <Link
        href={detailHref}
        className={`relative block overflow-hidden ${
          isRail ? "aspect-[5/4]" : "aspect-[16/10]"
        }`}
      >
        <VehicleImage
          vehicle={vehicle}
          placeholderSize={isRail ? "sm" : "lg"}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
        />
        {matchLabel ? (
          <span className="absolute left-4 top-4 rounded-full bg-[var(--ink)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {matchLabel}
          </span>
        ) : null}
      </Link>

      <div className={`flex flex-1 flex-col ${isRail ? "p-5" : "p-6"}`}>
        <Link href={detailHref} className="block transition hover:opacity-80">
          <h3 className="text-base font-semibold leading-snug text-[var(--ink)]">
            {title}
          </h3>
          {vehicle.trim ? (
            <p className="mt-0.5 text-xs text-[var(--muted)] line-clamp-1">
              {vehicle.trim}
            </p>
          ) : null}
        </Link>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <p className="text-lg font-semibold text-[var(--ink)]">
            {formatPrice(vehicle.internet_price)}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)]">
            #{vehicle.stock_number ?? "—"}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() =>
              openLead({
                action: "availability",
                vehicle,
                shopperIntent: `Check availability for ${label}`,
              })
            }
            className={btnPrimary}
          >
            Check Availability
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
            className={btnSecondary}
          >
            Build My Shortlist
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
            className={btnSecondary}
          >
            Compare Similar
          </button>
        </div>
      </div>
    </article>
  );
}
