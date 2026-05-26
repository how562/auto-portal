/** @preset map_multi_location — map + location picker */
"use client";

import { useState } from "react";
import Link from "next/link";
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { MapPlaceholder } from "@/components/section-showcase/primitives/MapPlaceholder";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { SHOWCASE_LOCATIONS, type ShowcaseLocationItem } from "@/lib/showcaseLocationData";
import { btnPrimaryMd } from "@/lib/buttonClasses";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetMapMultiLocation({
  locations = SHOWCASE_LOCATIONS,
  copy = {
    eyebrow: "Map",
    headline: "All locations on one map",
    body: "Select a store to update map focus and directions — wire to Mapbox or Google Maps API.",
  },
  devLabel = "Map 01 — Multi-location map",
}: {
  locations?: ShowcaseLocationItem[];
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  const [active, setActive] = useState(locations[0]?.id ?? "");

  const selected = locations.find((l) => l.id === active) ?? locations[0];

  return (
    <SectionShell pad="tight" devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)]">
        <MapPlaceholder
          label={selected ? `${selected.name} map` : "Map embed"}
          className="min-h-[18rem] lg:min-h-[24rem]"
        />
        <ul className="flex flex-col gap-2">
          {locations.map((loc) => {
            const isActive = loc.id === active;
            return (
              <li key={loc.id}>
                <button
                  type="button"
                  onClick={() => setActive(loc.id)}
                  className={`w-full rounded-md border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                      : "border-[var(--line-dark)] bg-white text-[var(--ink)] hover:border-[var(--ink)]/35"
                  }`}
                >
                  <span className="block font-semibold">{loc.name}</span>
                  <span
                    className={`mt-0.5 block text-xs ${isActive ? "text-white/70" : "text-[var(--muted)]"}`}
                  >
                    {loc.city}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {selected ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-md border border-[var(--line-dark)] bg-white px-5 py-4">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--ink)]">{selected.name}</span>
            {" — "}
            {selected.address}, {selected.city}
          </p>
          <Link href={selected.directionsUrl ?? "#"} className={btnPrimaryMd}>
            Directions
          </Link>
        </div>
      ) : null}
    </SectionShell>
  );
}
