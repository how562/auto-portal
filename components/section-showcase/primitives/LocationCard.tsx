import type { ShowcaseLocationItem } from "@/lib/showcaseLocationData";
import Link from "next/link";
import { btnSecondaryMd } from "@/lib/buttonClasses";

export function LocationCard({ location }: { location: ShowcaseLocationItem }) {
  return (
    <article className="flex h-full flex-col rounded-md border border-[var(--line-dark)] bg-white p-6 shadow-[var(--shadow-tight)]">
      <h3 className="text-lg font-semibold tracking-tight text-[var(--ink)]">{location.name}</h3>
      <address className="mt-4 not-italic text-sm leading-relaxed text-[var(--muted)]">
        {location.address}
        <br />
        {location.city}
      </address>
      <p className="mt-3 text-sm font-medium text-[var(--ink)]">{location.phone}</p>
      <p className="mt-2 text-xs text-[var(--muted)]">{location.hours}</p>
      <div className="mt-6 flex-1" />
      <Link
        href={location.directionsUrl ?? "#"}
        className={`${btnSecondaryMd} w-full justify-center text-center`}
      >
        Get directions
      </Link>
    </article>
  );
}
