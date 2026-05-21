"use client";

import { useMemo } from "react";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import { VehicleCard } from "@/components/portal/VehicleCard";
import { buildInventoryRails } from "@/lib/inventoryRails";
import { getMatchLabel } from "@/lib/matchLabels";
import Link from "next/link";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import type { HomepageSectionData, Vehicle } from "@/lib/types";

interface InventoryRailsSectionProps {
  vehicles: Vehicle[];
  sections: HomepageSectionData[];
  loadError: string | null;
}

export function InventoryRailsSection({
  vehicles,
  sections,
  loadError,
}: InventoryRailsSectionProps) {
  const { intent, budget, condition } = useDiscovery();
  const matchLabel = getMatchLabel(intent);

  const rails = useMemo(
    () => buildInventoryRails(vehicles, sections, intent, budget, condition),
    [vehicles, sections, intent, budget, condition],
  );

  return (
    <section id="inventory-rails" className="scroll-mt-20 overflow-hidden py-16 sm:py-24">
      <div className="portal-container mb-12">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
          Live inventory
        </p>
        <h2 className="mt-4 headline-stack text-4xl sm:text-5xl">
          Discover in motion
        </h2>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          Horizontal rails—swipe through real stock from Supabase, curated for
          your path.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <DiscoveryCTA size="compact" showBrowse={false} />
          <Link
            href="/inventory"
            className="rounded-full bg-[var(--ink)] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--charcoal)]"
          >
            Browse all inventory →
          </Link>
        </div>
      </div>

      {loadError ? (
        <div className="portal-container mb-8">
          <p className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
            {loadError}
          </p>
        </div>
      ) : null}

      <div className="space-y-16 sm:space-y-20">
        {rails.map((rail, index) => (
          <div
            key={rail.id}
            className={`grid items-start gap-6 lg:grid-cols-[220px_1fr] ${
              index % 2 === 1 ? "lg:grid-cols-[1fr_220px]" : ""
            }`}
          >
            <div
              className={`portal-container lg:max-w-none lg:px-0 ${
                index % 2 === 1
                  ? "lg:order-2 lg:col-start-2 lg:text-right"
                  : "lg:col-start-1"
              }`}
            >
              <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {rail.title}
              </h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{rail.subtitle}</p>
              <p className="mt-3 text-xs font-medium text-[var(--gold)]">
                {rail.vehicles.length} vehicles
              </p>
            </div>

            <div className={index % 2 === 1 ? "lg:order-1 lg:col-start-1" : ""}>
              {rail.vehicles.length === 0 ? (
                <div className="portal-container lg:pl-0">
                  <p className="rounded-[1.75rem] border border-dashed border-[var(--line-dark)] bg-white/60 px-6 py-14 text-center text-[var(--muted)]">
                    No vehicles in this rail yet
                  </p>
                </div>
              ) : (
                <div className="rail-scroll pl-4 sm:pl-6 lg:pl-8">
                  {rail.vehicles.map((vehicle) => (
                      <VehicleCard
                        key={`${rail.id}-${vehicle.id}`}
                        vehicle={vehicle}
                        matchLabel={matchLabel}
                        variant="rail"
                      />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
