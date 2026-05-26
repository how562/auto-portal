import Image from "next/image";
import type { ServiceLocation } from "@/lib/serviceSchedulingTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

function storeInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function ServiceLocationCard({ location }: { location: ServiceLocation }) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-[var(--line-dark)] bg-white p-5 shadow-[var(--shadow-tight)] sm:p-6">
      <div className="flex items-start gap-4">
        {location.logoUrl ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--cream)]">
            <Image
              src={location.logoUrl}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-contain p-1"
            />
          </div>
        ) : (
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--ink)] text-xs font-bold text-white"
            aria-hidden
          >
            {storeInitials(location.storeName)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold leading-snug text-[var(--ink)]">
            {location.storeName}
          </h2>
          {location.brand ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
              {location.brand}
            </p>
          ) : null}
        </div>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        {location.servicePhone ? (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">
              Service phone
            </dt>
            <dd className="mt-0.5 font-medium text-[var(--ink)]">{location.servicePhone}</dd>
          </div>
        ) : null}
        {location.address ? (
          <div>
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">
              Address
            </dt>
            <dd className="mt-0.5 text-[var(--muted)]">{location.address}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto flex flex-col gap-2.5 pt-6">
        {location.scheduleAvailable && location.scheduleUrl ? (
          <a
            href={location.scheduleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnPrimaryMd} min-h-[3rem] no-underline`}
          >
            Schedule Service
          </a>
        ) : (
          <span
            className={`${btnPrimaryMd} min-h-[3rem] cursor-not-allowed opacity-50`}
            aria-disabled
          >
            Scheduling link coming soon
          </span>
        )}

        {location.callAvailable && location.servicePhoneTel ? (
          <a
            href={location.servicePhoneTel}
            className={`${btnSecondaryMd} min-h-[3rem] no-underline`}
          >
            Call Service
          </a>
        ) : location.servicePhone ? (
          <span className={`${btnSecondaryMd} min-h-[3rem] cursor-default opacity-70`}>
            Call dealership
          </span>
        ) : null}
      </div>
    </article>
  );
}
