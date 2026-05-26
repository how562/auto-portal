/** @preset location_grid — locations[] repeater */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { LocationCard } from "@/components/section-showcase/primitives/LocationCard";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { SHOWCASE_LOCATIONS, type ShowcaseLocationItem } from "@/lib/showcaseLocationData";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetLocationGrid({
  locations = SHOWCASE_LOCATIONS,
  copy = {
    eyebrow: "Visit us",
    headline: "Stores across the region",
    body: "Location cards driven by a CMS repeater — hours, phone, and directions per store.",
  },
  devLabel = "Location 01 — Store card grid",
}: {
  locations?: ShowcaseLocationItem[];
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <ul className="grid gap-6 md:grid-cols-3">
        {locations.map((loc) => (
          <li key={loc.id}>
            <LocationCard location={loc} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
