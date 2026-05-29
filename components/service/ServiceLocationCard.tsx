import type { ServiceLocation } from "@/lib/serviceSchedulingTypes";
import { DealershipDepartmentList } from "@/components/dealership/DealershipDepartmentList";

import "@/app/dealership-dept-list.css";

function splitAddress(address: string): { line1: string; line2: string | null } {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 2) {
    return { line1: address, line2: null };
  }
  return {
    line1: parts.slice(0, 2).join(", "),
    line2: parts.slice(2).join(", "),
  };
}

export function ServiceLocationCard({
  location,
  imageUrl,
}: {
  location: ServiceLocation;
  imageUrl: string;
}) {
  const addressLines = location.address ? splitAddress(location.address) : null;

  return (
    <article className="schedule-service-card">
      <div className="schedule-service-card__photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" />
      </div>
      <div className="schedule-service-card__body">
        <h2 className="schedule-service-card__name">{location.storeName}</h2>
        {addressLines ? (
          <address className="schedule-service-card__address not-italic">
            <span>{addressLines.line1}</span>
            {addressLines.line2 ? <span>{addressLines.line2}</span> : null}
          </address>
        ) : null}
        {location.departments?.length ? (
          <DealershipDepartmentList departments={location.departments} />
        ) : null}
        {location.scheduleAvailable && location.scheduleUrl ? (
          <a
            href={location.scheduleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="schedule-service-card__cta"
          >
            {location.scheduleCtaLabel ?? "Schedule Service"}
          </a>
        ) : (
          <span className="schedule-service-card__cta schedule-service-card__cta--disabled">
            Scheduling link coming soon
          </span>
        )}
      </div>
    </article>
  );
}
