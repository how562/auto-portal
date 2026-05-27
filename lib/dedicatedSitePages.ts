import { BRAND_NAME } from "@/lib/brand";
import type { DedicatedPageSlug } from "@/lib/dedicatedPageContent/types";

export interface DedicatedSitePageDefinition {
  slug: DedicatedPageSlug;
  title: string;
  metaDescription: string;
  livePath: string;
  contentSource: string;
  adminNote: string;
  /** Re-provision as published when Site pages loads (system routes). */
  keepPublished: boolean;
}

export const DEDICATED_SITE_PAGES: DedicatedSitePageDefinition[] = [
  {
    slug: "about-us",
    title: "About Us",
    metaDescription: `Learn about ${BRAND_NAME} — our story, values, and commitment to customers across Texas.`,
    livePath: "/about-us",
    contentSource: "CMS page content",
    adminNote:
      "Edit all About Us copy in the dedicated content editor. Layout and styling are fixed.",
    keepPublished: true,
  },
  {
    slug: "locations",
    title: "Locations",
    metaDescription: `Find ${BRAND_NAME} dealerships across South and Central Texas. View hours, directions, and contact information.`,
    livePath: "/locations",
    contentSource: "CMS page content",
    adminNote:
      "Edit Locations page copy in the dedicated content editor. Store cards still come from the database.",
    keepPublished: true,
  },
  {
    slug: "schedule-service",
    title: "Schedule Service",
    metaDescription: `Schedule service online or call the service department at any ${BRAND_NAME} dealership.`,
    livePath: "/schedule-service",
    contentSource: "CMS page content",
    adminNote:
      "Edit Schedule Service page copy in the dedicated content editor. Service cards still come from store data.",
    keepPublished: true,
  },
  {
    slug: "executive-team",
    title: "Executive Team",
    metaDescription:
      "Meet the executive leadership team at Cavender Auto Group — experienced leaders committed to customers, team members, and community.",
    livePath: "/executive-team",
    contentSource: "CMS page content",
    adminNote:
      "Edit Executive Team copy, portraits, and CTAs in the dedicated content editor.",
    keepPublished: true,
  },
  {
    slug: "value-your-trade",
    title: "Value Your Trade",
    metaDescription:
      "Get a trade-in value for your vehicle with Cavender Auto Group. Quick online offers from our trusted partner.",
    livePath: "/value-your-trade",
    contentSource: "CMS page content",
    adminNote:
      "Edit hero copy and partner iframe URL/height in the dedicated content editor.",
    keepPublished: true,
  },
];

export function getDedicatedSitePage(
  slug: string,
): DedicatedSitePageDefinition | undefined {
  return DEDICATED_SITE_PAGES.find((page) => page.slug === slug);
}

export function isDedicatedSitePageSlug(slug: string): boolean {
  return DEDICATED_SITE_PAGES.some((page) => page.slug === slug);
}
