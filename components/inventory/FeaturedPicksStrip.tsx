"use client";

import Link from "next/link";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import {
  formatPrice,
  formatVehicleTitle,
  vehicleDetailPath,
} from "@/lib/format";
import type { Vehicle } from "@/lib/types";

interface FeaturedPicksStripProps {
  vehicles: Vehicle[];
  microcopyFor: (vehicle: Vehicle) => string;
}

export function FeaturedPicksStrip({
  vehicles,
  microcopyFor,
}: FeaturedPicksStripProps) {
  if (vehicles.length === 0) return null;

  return (
    <div className="rounded-[2rem] bg-[var(--charcoal)] px-6 py-8 text-white sm:px-10 sm:py-10">
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
            href={vehicleDetailPath(vehicle.id)}
            className="group flex gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-white/25 hover:bg-white/[0.08]"
          >
            <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-white/10">
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
                {formatPrice(vehicle.internet_price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
