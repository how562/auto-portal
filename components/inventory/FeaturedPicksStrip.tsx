"use client";

import Link from "next/link";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import {
  formatVehiclePrice,
  formatVehicleTitle,
  vehicleDetailPath,
} from "@/lib/format";
import type { Vehicle } from "@/lib/types";

interface FeaturedPicksStripProps {
  vehicles: Vehicle[];
  microcopyFor: (vehicle: Vehicle) => string;
  audienceKey?: string | null;
  siteStoreId?: string | null;
}

export function FeaturedPicksStrip({
  vehicles,
  microcopyFor,
  audienceKey = null,
}: FeaturedPicksStripProps) {
  if (vehicles.length === 0) return null;

  return (
    <div className="rounded-md border border-white/10 bg-[var(--charcoal)] px-6 py-8 text-white sm:px-10 sm:py-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-soft)]">
        Featured picks
      </p>
      <p className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
        Standouts from this match set
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {vehicles.map((vehicle) => (
          <Link
            key={vehicle.id}
            href={vehicleDetailPath(vehicle.id, { audience: audienceKey })}
            className="group flex gap-4 overflow-hidden rounded-md border border-white/10 bg-white/[0.04] p-4 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.08]"
          >
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
              <VehicleImage
                vehicle={vehicle}
                placeholderSize="sm"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0 py-1">
              <p className="truncate font-semibold">{formatVehicleTitle(vehicle)}</p>
              <p className="mt-1 text-xs italic text-white/50">
                {microcopyFor(vehicle)}
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--gold-soft)]">
                {formatVehiclePrice(vehicle)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
