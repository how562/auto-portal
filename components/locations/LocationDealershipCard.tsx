import type { DealershipLocation } from "@/lib/locationsPageTypes";

export function LocationDealershipCard({ location }: { location: DealershipLocation }) {
  return (
    <article
      id={`location-${location.id}`}
      className="locations-card"
      aria-labelledby={`location-name-${location.id}`}
    >
      <div className="locations-card__media">
        <span className="locations-card__badge" aria-hidden>
          {location.number}
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={location.imageUrl} alt="" className="locations-card__img" />
      </div>
      <div className="locations-card__body">
        <h2 id={`location-name-${location.id}`} className="locations-card__name">
          {location.storeName}
        </h2>
        <address className="locations-card__address not-italic">
          <span>{location.addressLine1}</span>
          {location.addressLine2 ? <span>{location.addressLine2}</span> : null}
        </address>
        <a
          href={location.viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="locations-card__cta"
        >
          View location
        </a>
      </div>
    </article>
  );
}
