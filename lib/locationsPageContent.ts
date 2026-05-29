import { DEFAULT_DEALERSHIP_DIRECTORY } from "./dealershipDirectoryContent";
import { BRAND_NAME } from "./brand";
import type { LocationsPageContent } from "./locationsPageTypes";

export { LOCATION_IMAGE_POOL, LOCATION_MAP_POSITIONS } from "./dealershipImagery";

export const LOCATIONS_PAGE_CONTENT: LocationsPageContent = {
  hero: {
    kicker: BRAND_NAME.toUpperCase(),
    title: "Our Locations",
    tagline: `Proudly serving South and Central Texas. 8 locations. One standard.`,
    imageUrl: "/images/hero/dealership.jpg",
  },
  map: {
    eyebrow: "Close to you.",
    headline: "Find a Cavender dealership near you.",
    paragraphs: [
      "With dealerships across South and Central Texas, quality vehicles and expert service are never far away.",
      "Select your nearest location below to view hours, directions, inventory, and contact information.",
    ],
    ctaLabel: "View all locations",
  },
  help: {
    headline: "We're here to help.",
    body: "Whether you're shopping for your next vehicle or scheduling service, our team is committed to delivering the same standard of care at every Cavender location.",
    features: [
      {
        id: "convenient",
        title: "Convenient",
        description: "Multiple locations across the region for easy access.",
        icon: "pin",
      },
      {
        id: "access",
        title: "Easy Access",
        description: "Major highways and clear directions to every store.",
        icon: "clock",
      },
      {
        id: "standard",
        title: "One Standard",
        description: "The Cavender experience you expect, everywhere.",
        icon: "handshake",
      },
      {
        id: "community",
        title: "Community",
        description: "Proud to serve the communities we call home.",
        icon: "community",
      },
    ],
  },
  dealerships: structuredClone(DEFAULT_DEALERSHIP_DIRECTORY),
};

