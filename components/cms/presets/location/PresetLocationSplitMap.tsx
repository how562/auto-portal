/** @preset location_split_map — featured location + map embed */
import Link from "next/link";
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { MapPlaceholder } from "@/components/section-showcase/primitives/MapPlaceholder";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import {
  SHOWCASE_FEATURED_LOCATION,
  type ShowcaseLocationItem,
} from "@/lib/showcaseLocationData";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetLocationSplitMap({
  location = SHOWCASE_FEATURED_LOCATION,
  copy = {
    eyebrow: "Directions",
    headline: "Find our flagship store",
    body: "Split layout pairs store details with a map embed placeholder.",
  },
  devLabel = "Location 02 — Split map + details",
}: {
  location?: ShowcaseLocationItem;
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell className="bg-white" devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col justify-center rounded-md border border-[var(--line-dark)] bg-[var(--cream)] p-6 sm:p-8">
          <h3 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            {location.name}
          </h3>
          <address className="mt-4 not-italic text-base leading-relaxed text-[var(--muted)]">
            {location.address}
            <br />
            {location.city}
          </address>
          <p className="mt-4 font-medium text-[var(--ink)]">{location.phone}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">{location.hours}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={location.directionsUrl ?? "#"} className={btnPrimaryMd}>
              Get directions
            </Link>
            <Link href={`tel:${location.phone.replace(/\D/g, "")}`} className={btnSecondaryMd}>
              Call store
            </Link>
          </div>
        </div>
        <MapPlaceholder label="Store map" className="min-h-[16rem] lg:min-h-full" />
      </div>
    </SectionShell>
  );
}
