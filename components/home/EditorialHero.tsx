"use client";

import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import { formatVehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

const TRUST_PILLS = [
  "Real inventory",
  "Multiple dealerships",
  "Guided discovery",
];

interface EditorialHeroProps {
  previewVehicles: Vehicle[];
}

function MiniVehicleTile({
  vehicle,
  className,
}: {
  vehicle: Vehicle;
  className?: string;
}) {
  const title = formatVehicleTitle(vehicle);
  return (
    <div
      className={`card-framer overflow-hidden hover-lift ${className ?? ""}`}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-[var(--cream-dark)] to-[var(--line)]">
        {vehicle.primary_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicle.primary_image_url}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="h-12 w-20 rounded-xl bg-[var(--charcoal)]/10" />
          </div>
        )}
      </div>
      <p className="truncate px-4 py-3 text-xs font-semibold">{title}</p>
    </div>
  );
}

export function EditorialHero({ previewVehicles }: EditorialHeroProps) {
  const tiles = previewVehicles.slice(0, 3);

  return (
    <section className="relative overflow-hidden bg-[var(--cream)] pt-24 pb-16 sm:pb-24 lg:pt-28">
      <div className="portal-container">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <div className="headline-stack space-y-0">
              <span className="block text-[clamp(2.75rem,8vw,5.5rem)] text-[var(--ink)]">
                Find Your Fit
              </span>
              <span className="block text-[clamp(2.75rem,8vw,5.5rem)] text-[var(--muted)]">
                Across Every Store
              </span>
            </div>

            <p className="mt-8 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg">
              A guided auto group portal—shop real inventory, compare paths, and
              connect with the right dealership without the usual noise.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {TRUST_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-[var(--line-dark)] bg-white px-4 py-2 text-xs font-medium text-[var(--ink)]"
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-10">
              <DiscoveryCTA />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative grid grid-cols-12 gap-3 sm:gap-4">
              {tiles[0] ? (
                <MiniVehicleTile
                  vehicle={tiles[0]}
                  className="col-span-7 row-span-2 animate-float-slow"
                />
              ) : (
                <div className="card-framer col-span-7 aspect-[4/5] animate-float-slow bg-white" />
              )}
              {tiles[1] ? (
                <MiniVehicleTile
                  vehicle={tiles[1]}
                  className="col-span-5 mt-8 animate-float-delayed"
                />
              ) : null}
              {tiles[2] ? (
                <MiniVehicleTile
                  vehicle={tiles[2]}
                  className="col-span-5 -mt-4 col-start-8"
                />
              ) : null}
            </div>
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-[var(--gold)]/20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
