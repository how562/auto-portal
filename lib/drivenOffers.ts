/**
 * Homepage "Driven Offers" content — replace image paths when marketing assets are ready.
 * Wire to Cavender Online / specials CMS when available.
 */

export type DrivenOfferBadge = "SALES" | "SERVICE";

export interface DrivenOfferCardData {
  id: string;
  variant: "hero" | "secondary";
  label: string;
  headline: string;
  supporting: string;
  badge: DrivenOfferBadge;
  cta: string;
  href: string;
  /** Path under /public */
  imageSrc: string;
  /** Used if imageSrc is missing */
  imageFallback: string;
}

export const DRIVEN_OFFERS_VIEW_ALL_HREF = "/specials";

export const DRIVEN_OFFERS_HERO: DrivenOfferCardData = {
  id: "truck-month",
  variant: "hero",
  label: "FEATURED THIS MONTH",
  headline: "Truck Month Savings",
  supporting:
    "Featured offers on select trucks across participating Cavender dealerships.",
  badge: "SALES",
  cta: "Explore Offer",
  href: "/specials/sales",
  imageSrc: "/images/hero/vehicle.jpg",
  imageFallback: "/images/hero/vehicle.png",
};

export const DRIVEN_OFFERS_SECONDARY: DrivenOfferCardData[] = [
  {
    id: "sierra-savings",
    variant: "secondary",
    label: "LIMITED-TIME OFFER",
    headline: "Sierra Savings Event",
    supporting: "Current offers on select GMC Sierra models.",
    badge: "SALES",
    cta: "View Offer",
    href: "/specials/sales",
    imageSrc: "/images/hero/lifestyle.jpg",
    imageFallback: "/images/hero/lifestyle.png",
  },
  {
    id: "seasonal-service",
    variant: "secondary",
    label: "SERVICE SPOTLIGHT",
    headline: "Seasonal Service Specials",
    supporting: "Maintenance offers available at participating locations.",
    badge: "SERVICE",
    cta: "View Service Offers",
    href: "/specials/service",
    imageSrc: "/images/hero/dealership.jpg",
    imageFallback: "/images/hero/dealership.png",
  },
];
