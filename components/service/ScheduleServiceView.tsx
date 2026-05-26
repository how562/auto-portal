import { ScheduleServiceHeader } from "@/components/service/ScheduleServiceHeader";
import { ServiceLocationCard } from "@/components/service/ServiceLocationCard";
import { SCHEDULE_SERVICE_PAGE_CONTENT } from "@/lib/serviceSchedulingContent";
import type { ServiceLocation } from "@/lib/serviceSchedulingTypes";

interface ScheduleServiceViewProps {
  locations: ServiceLocation[];
}

export function ScheduleServiceView({ locations }: ScheduleServiceViewProps) {
  return (
    <>
      <ScheduleServiceHeader content={SCHEDULE_SERVICE_PAGE_CONTENT} />
      <section className="portal-container py-10 sm:py-14" aria-label="Dealership service locations">
        {locations.length === 0 ? (
          <p className="rounded-xl border border-[var(--line)] bg-white px-6 py-10 text-center text-sm text-[var(--muted)]">
            Service locations are being updated. Please check back soon or contact your
            nearest Cavender dealership.
          </p>
        ) : (
          <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
            {locations.map((location) => (
              <li key={location.id}>
                <ServiceLocationCard location={location} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
