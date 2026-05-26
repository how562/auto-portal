"use client";

import "@/app/driven-offers-section.css";

import Image from "next/image";
import Link from "next/link";
import {
  DRIVEN_OFFERS_HERO,
  DRIVEN_OFFERS_SECONDARY,
  DRIVEN_OFFERS_VIEW_ALL_HREF,
  type DrivenOfferCardData,
} from "@/lib/drivenOffers";

function OfferCtaArrow({ className = "" }: { className?: string }) {
  return (
    <span
      className={`driven-offer-card__cta-arrow inline-flex shrink-0 transition-transform duration-300 ease-out ${className}`.trim()}
      aria-hidden
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function DrivenOfferBadge({ type }: { type: "SALES" | "SERVICE" }) {
  return (
    <span
      className={`driven-offer-card__badge driven-offer-card__badge--${type.toLowerCase()}`}
    >
      {type}
    </span>
  );
}

function DrivenOfferCard({
  offer,
  index,
}: {
  offer: DrivenOfferCardData;
  index: number;
}) {
  const isHero = offer.variant === "hero";

  return (
    <article
      className={`driven-offer-card driven-offer-card--${offer.variant} group`}
      style={{ ["--driven-offer-delay" as string]: `${index * 80}ms` }}
    >
      <Link href={offer.href} className="driven-offer-card__link">
        <div className="driven-offer-card__media">
          <Image
            src={offer.imageSrc}
            alt=""
            fill
            sizes={
              isHero
                ? "(max-width: 1024px) 100vw, 62vw"
                : "(max-width: 1024px) 100vw, 38vw"
            }
            className="driven-offer-card__image object-cover"
          />
          <span className="driven-offer-card__overlay" aria-hidden />
        </div>

        <div className="driven-offer-card__body">
          <p className="driven-offer-card__label">{offer.label}</p>
          <h3 className="driven-offer-card__headline">{offer.headline}</h3>
          <p className="driven-offer-card__supporting">{offer.supporting}</p>
          <div className="driven-offer-card__footer">
            <DrivenOfferBadge type={offer.badge} />
            <span className="driven-offer-card__cta">
              {offer.cta}
              <OfferCtaArrow />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/** Editorial offers band — between Shop by Life and Refine your fit. */
export function DrivenOffersSection() {
  return (
    <section
      id="driven-offers"
      className="homepage-driven-offers scroll-mt-20 py-14 sm:py-20 lg:py-24"
      aria-labelledby="driven-offers-heading"
    >
      <div className="homepage-driven-offers__texture" aria-hidden>
        <span className="homepage-driven-offers__tread" />
        <span className="homepage-driven-offers__blueprint" />
        <span className="homepage-driven-offers__gear" />
      </div>

      <div className="portal-container homepage-driven-offers__inner">
        <header className="driven-offers-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--gold)]">
              DRIVEN OFFERS
            </p>
            <h2
              id="driven-offers-heading"
              className="driven-offers-headline mt-3 font-sans text-[clamp(1.75rem,4.5vw,2.85rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--ink)]"
            >
              Offers built to move.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-[15px] sm:leading-[1.55]">
              Explore current sales and service specials across the Cavender family
              of dealerships.
            </p>
          </div>

          <Link
            href={DRIVEN_OFFERS_VIEW_ALL_HREF}
            className="driven-offers-view-all shrink-0 text-sm font-semibold text-[var(--ink)] transition hover:text-[var(--gold)]"
          >
            View all offers
            <OfferCtaArrow className="ml-1" />
          </Link>
        </header>

        <div className="driven-offers-editorial mt-8 lg:mt-10">
          <DrivenOfferCard offer={DRIVEN_OFFERS_HERO} index={0} />
          <div className="driven-offers-editorial__stack flex flex-col gap-4">
            {DRIVEN_OFFERS_SECONDARY.map((offer, i) => (
              <DrivenOfferCard key={offer.id} offer={offer} index={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
