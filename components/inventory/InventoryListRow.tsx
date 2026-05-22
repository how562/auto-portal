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
  const title = formatVehicleTitle(vehicle);
  const label = formatVehicleLabel(vehicle);
  const detailHref = vehicleDetailPath(vehicle.id);

  const meta = [vehicle.body_style, vehicle.condition]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group flex flex-col gap-4 overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-black/[0.05] transition hover:shadow-[0_12px_40px_rgba(12,12,12,0.08)] sm:flex-row sm:items-stretch sm:p-4">
      <Link
        href={detailHref}
        className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl sm:aspect-auto sm:h-28 sm:w-44"
      >
        <VehicleImage
          vehicle={vehicle}
          placeholderSize="sm"
          className="h-full w-full object-cover"
        />
        {matchLabel ? (
          <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--ink)]">
            {matchLabel}
          </span>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <Link href={detailHref} className="block">
          <h3 className="text-base font-semibold tracking-tight text-[var(--ink)] sm:text-lg">
            {title}
          </h3>
          {vehicle.trim ? (
            <p className="mt-0.5 truncate text-sm text-[var(--muted)]">
              {vehicle.trim}
            </p>
          ) : null}
        </Link>
        {meta ? (
          <p className="mt-1 text-xs text-[var(--muted)]">{meta}</p>
        ) : null}
        <p className="mt-1 text-xs italic text-[var(--muted)]">{microcopy}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-lg font-semibold text-[var(--ink)]">
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
        <Link
          href={detailHref}
          className="rounded-full bg-[var(--ink)] px-4 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-[var(--charcoal)]"
        >
          Details
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
            className="flex-1 rounded-full border border-[var(--line-dark)] px-2 py-2 text-[10px] font-semibold text-[var(--ink)] hover:border-[var(--ink)]"
          >
            Save
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
            className="flex-1 rounded-full border border-[var(--line-dark)] px-2 py-2 text-[10px] font-semibold text-[var(--ink)] hover:border-[var(--ink)]"
          >
            Check
          </button>
        </div>
      </div>
    </article>
  );
}
