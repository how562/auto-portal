"use client";

import { CavenderLogo } from "@/components/brand/CavenderLogo";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import { formatVehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { getVehicleImageUrl } from "@/lib/vehicleImage";

const TRUST_PILLS = [
  "Real inventory",
  "Multiple dealerships",
  "Guided discovery",
];

interface EditorialHeroProps {
  previewVehicles: Vehicle[];
  loadError?: string | null;
}

function selectHeroTiles(vehicles: Vehicle[]): Vehicle[] {
  return (vehicles ?? []).slice(0, 3);
}

function HeroVehicleTile({
  vehicle,
  variant,
  className,
}: {
  vehicle: Vehicle;
  variant: "primary" | "secondary";
  className?: string;
}) {
  const title = formatVehicleTitle(vehicle);
  const isPrimary = variant === "primary";

  return (
    <div className={`hero-collage-frame ${className ?? ""}`}>
      <div
        className={`relative overflow-hidden ${
          isPrimary ? "aspect-[3/4]" : "aspect-[5/4]"
        }`}
      >
        <div className="absolute inset-0">
          <VehicleImage
            vehicle={vehicle}
            large={isPrimary}
            placeholderSize={isPrimary ? "hero" : "md"}
            className="h-full w-full object-cover"
          />
        </div>
        {isPrimary && getVehicleImageUrl(vehicle) ? (
          <>
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in srgb, var(--ink) 50%, transparent), transparent)",
              }}
            />
            <p className="absolute bottom-4 left-4 right-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/90">
              Featured inventory
            </p>
          </>
        ) : null}
      </div>
      {!isPrimary ? (
        <p className="truncate px-4 py-3 text-xs font-semibold">{title}</p>
      ) : null}
    </div>
  );
}

function HeroCollageFallback({
  loadError,
}: {
  loadError?: string | null;
}) {
  return (
    <div className="hero-collage-frame flex aspect-[4/5] w-full max-w-xl flex-col justify-between bg-gradient-to-br from-[var(--charcoal)] via-[var(--charcoal-soft)] to-[var(--ink)] p-8 text-white sm:aspect-[3/4] lg:max-w-none lg:aspect-auto lg:min-h-[32rem]">
      <div>
        <CavenderLogo size="hero" variant="light" />
        <p className="mt-6 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          Real vehicles. Every store. One guided path.
        </p>
      </div>
      <div>
        {loadError ? (
          <p className="mb-4 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-xs leading-relaxed text-white/80">
            {loadError}
          </p>
        ) : (
          <p className="mb-4 text-sm text-white/55">
            Inventory previews appear here as vehicles sync from your stores.
          </p>
        )}
        <div className="flex gap-2">
          <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
          <span className="h-2 w-2 rounded-full bg-white/30" />
          <span className="h-2 w-2 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}

function HeroCollage({
  tiles,
  loadError,
}: {
  tiles: Vehicle[];
  loadError?: string | null;
}) {
  if (tiles.length === 0) {
    return <HeroCollageFallback loadError={loadError} />;
  }

  return (
    <div className="relative w-full min-h-[28rem] sm:min-h-[32rem] lg:min-h-[36rem] xl:min-h-[40rem]">
      <div className="hero-collage-backdrop-cream" aria-hidden />
      <div className="hero-collage-backdrop-gold" aria-hidden />
      <div className="relative grid h-full grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
        {tiles[0] ? (
          <HeroVehicleTile
            vehicle={tiles[0]}
            variant="primary"
            className="col-span-7 row-span-2 animate-hero-drift"
          />
        ) : null}
        {tiles[1] ? (
          <HeroVehicleTile
            vehicle={tiles[1]}
            variant="secondary"
            className="col-span-5 mt-8 lg:mt-10"
          />
        ) : null}
        {tiles[2] ? (
          <HeroVehicleTile
            vehicle={tiles[2]}
            variant="secondary"
            className="col-span-5 -mt-4 col-start-8 lg:-mt-6"
          />
        ) : null}
      </div>
    </div>
  );
}

export function EditorialHero({
  previewVehicles,
  loadError,
}: EditorialHeroProps) {
  const tiles = selectHeroTiles(previewVehicles);

  return (
    <section className="relative overflow-hidden bg-[var(--cream)] pt-28 pb-16 sm:pb-24 lg:pt-32 lg:pb-28">
      <div className="portal-container">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
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

          <HeroCollage tiles={tiles} loadError={loadError} />
        </div>
      </div>
    </section>
  );
}
