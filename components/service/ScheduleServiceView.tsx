import {
  SCHEDULE_SERVICE_PAGE_CONTENT,
  serviceLocationImageUrl,
} from "@/lib/serviceSchedulingContent";
import type {
  ScheduleServicePageContent,
  ServiceLocation,
} from "@/lib/serviceSchedulingTypes";
import { PageHeaderRenderer } from "@/components/page-headers/PageHeaderRenderer";
import { ScheduleServiceFeatureIcon } from "@/components/service/ScheduleServiceFeatureIcons";
import { resolvePageHeader } from "@/lib/pageHeaderResolve";
import { mergeServiceLocationsWithCms } from "@/lib/dealershipDirectoryMerge";
import { ServiceLocationCard } from "@/components/service/ServiceLocationCard";

import "@/app/schedule-service-page.css";

interface ScheduleServiceViewProps {
  locations: ServiceLocation[];
  content?: ScheduleServicePageContent;
}

export function ScheduleServiceView({
  locations,
  content = SCHEDULE_SERVICE_PAGE_CONTENT,
}: ScheduleServiceViewProps) {
  const mergedLocations = mergeServiceLocationsWithCms(
    locations,
    content.dealerships,
  );
  const locationCount = mergedLocations.length;
  const eyebrowLabel =
    locationCount > 0
      ? `${locationCount} Locations. One Standard.`
      : "Locations. One Standard.";

  const header = resolvePageHeader("schedule-service", content);
  const headerHidden = content.header?.type === "none";

  return (
    <div className="schedule-service-page">
      <PageHeaderRenderer header={header} />

      {!headerHidden ? (
        <section className="schedule-service-intro" aria-labelledby="schedule-service-intro-title">
          <div className="portal-container schedule-service-intro__inner">
            <p className="schedule-service-intro__eyebrow">
              <span className="schedule-service-intro__eyebrow-line" aria-hidden />
              {eyebrowLabel}
              <span className="schedule-service-intro__eyebrow-line" aria-hidden />
            </p>
            <h2 id="schedule-service-intro-title" className="schedule-service-intro__headline">
              {content.intro.headline}
            </h2>
            <p className="schedule-service-intro__subhead">{content.intro.subheadline}</p>
          </div>
        </section>
      ) : null}

      <section
        className="schedule-service-locations"
        aria-label="Dealership service locations"
      >
        <div className="portal-container">
          {mergedLocations.length === 0 ? (
            <p className="schedule-service-empty">
              Service locations are being updated. Please check back soon or contact your
              nearest Cavender dealership.
            </p>
          ) : (
            <ul className="schedule-service-grid">
              {mergedLocations.map((location, index) => (
                <li key={location.id}>
                  <ServiceLocationCard
                    location={location}
                    imageUrl={location.imageUrl ?? serviceLocationImageUrl(index)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="schedule-service-features" aria-labelledby="schedule-service-features-title">
        <div className="portal-container">
          <h2 id="schedule-service-features-title" className="sr-only">
            Why schedule with Cavender
          </h2>
          <ul className="schedule-service-features__grid">
            {content.features.map((feature) => (
              <li key={feature.id} className="schedule-service-feature">
                <ScheduleServiceFeatureIcon type={feature.icon} />
                <h3 className="schedule-service-feature__title">{feature.title}</h3>
                <p className="schedule-service-feature__desc">{feature.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
