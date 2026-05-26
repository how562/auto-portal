import { LOCATIONS_PAGE_CONTENT } from "@/lib/locationsPageContent";
import type { DealershipLocation } from "@/lib/locationsPageTypes";
import { LocationDealershipCard } from "@/components/locations/LocationDealershipCard";
import { LocationsFeatureIcon } from "@/components/locations/LocationsFeatureIcons";
import { LocationsMapPanel } from "@/components/locations/LocationsMapPanel";

import "@/app/locations-page.css";

interface LocationsPageViewProps {
  locations: DealershipLocation[];
}

export function LocationsPageView({ locations }: LocationsPageViewProps) {
  const content = LOCATIONS_PAGE_CONTENT;
  const count = locations.length;
  const tagline =
    count > 0
      ? `Proudly serving South and Central Texas. ${count} locations. One standard.`
      : content.hero.tagline;

  return (
    <div className="locations-page">
      <section className="locations-hero" aria-labelledby="locations-hero-title">
        <div className="locations-hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.hero.imageUrl} alt="" className="locations-hero__img" />
          <div className="locations-hero__overlay" aria-hidden />
        </div>
        <div className="locations-hero__content">
          <p className="locations-hero__kicker">{content.hero.kicker}</p>
          <h1 id="locations-hero-title" className="locations-hero__title">
            {content.hero.title}
          </h1>
          <span className="locations-hero__divider" aria-hidden />
          <p className="locations-hero__tagline">{tagline}</p>
        </div>
      </section>

      <section className="locations-map-section" aria-labelledby="locations-map-title">
        <div className="portal-container locations-map-section__inner">
          <div className="locations-map-section__copy">
            <p className="locations-map-section__eyebrow">{content.map.eyebrow}</p>
            <h2 id="locations-map-title" className="locations-map-section__headline">
              {content.map.headline}
            </h2>
            {content.map.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="locations-map-section__body">
                {paragraph}
              </p>
            ))}
            <a href="#dealership-locations" className="locations-map-section__cta">
              {content.map.ctaLabel}
            </a>
          </div>
          <LocationsMapPanel locations={locations} />
        </div>
      </section>

      <section
        id="dealership-locations"
        className="locations-grid-section"
        aria-label="All dealership locations"
      >
        <div className="portal-container">
          {locations.length === 0 ? (
            <p className="locations-grid-section__empty">
              Our locations are being updated. Please check back soon.
            </p>
          ) : (
            <ul className="locations-grid">
              {locations.map((location) => (
                <li key={location.id}>
                  <LocationDealershipCard location={location} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="locations-help" aria-labelledby="locations-help-title">
        <div className="portal-container locations-help__inner">
          <div className="locations-help__intro">
            <h2 id="locations-help-title" className="locations-help__headline">
              {content.help.headline}
            </h2>
            <p className="locations-help__body">{content.help.body}</p>
          </div>
          <ul className="locations-help__features">
            {content.help.features.map((feature) => (
              <li key={feature.id} className="locations-help__feature">
                <LocationsFeatureIcon type={feature.icon} />
                <h3 className="locations-help__feature-title">{feature.title}</h3>
                <p className="locations-help__feature-desc">{feature.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
