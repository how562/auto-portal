/** @preset directions_panel — address + map provider CTAs */
import Link from "next/link";
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { MapPlaceholder } from "@/components/section-showcase/primitives/MapPlaceholder";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { SHOWCASE_FEATURED_LOCATION } from "@/lib/showcaseLocationData";
import { btnSecondaryMd } from "@/lib/buttonClasses";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

const MAP_APPS = [
  { label: "Google Maps", href: "#google-maps" },
  { label: "Apple Maps", href: "#apple-maps" },
  { label: "Waze", href: "#waze" },
];

export function PresetDirectionsPanel({
  copy = {
    eyebrow: "Get here",
    headline: "Directions & parking",
    body: "Offer one-tap links to native map apps plus optional parking notes.",
  },
  devLabel = "Map 02 — Directions panel",
}: {
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  const loc = SHOWCASE_FEATURED_LOCATION;

  return (
    <SectionShell className="bg-[var(--cream-dark)]/35" devLabel={devLabel}>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div>
          <PresetSectionIntro copy={copy} align="left" />
          <address className="mt-6 not-italic text-lg leading-relaxed text-[var(--ink)]">
            {loc.name}
            <br />
            {loc.address}
            <br />
            {loc.city}
          </address>
          <p className="mt-4 text-sm text-[var(--muted)]">
            Complimentary guest parking behind the showroom. Enter from Harbor Blvd.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {MAP_APPS.map((app) => (
              <Link key={app.label} href={app.href} className={btnSecondaryMd}>
                {app.label}
              </Link>
            ))}
          </div>
        </div>
        <MapPlaceholder label="Directions map" className="min-h-[14rem] sm:min-h-[18rem]" />
      </div>
    </SectionShell>
  );
}
