import type { AboutUsPageContent } from "@/lib/aboutUsPageContent";
import type { ExecutiveTeamPageContent } from "@/lib/executiveTeamPageContent";
import type { LocationsPageContent } from "@/lib/locationsPageTypes";
import type { ScheduleServicePageContent } from "@/lib/serviceSchedulingTypes";
import type { ValueYourTradePageContent } from "@/lib/valueYourTradePageContent";

export const DEDICATED_PAGE_SLUGS = [
  "about-us",
  "locations",
  "schedule-service",
  "executive-team",
  "value-your-trade",
] as const;

export type DedicatedPageSlug = (typeof DEDICATED_PAGE_SLUGS)[number];

export type DedicatedPageContentBySlug = {
  "about-us": AboutUsPageContent;
  locations: LocationsPageContent;
  "schedule-service": ScheduleServicePageContent;
  "executive-team": ExecutiveTeamPageContent;
  "value-your-trade": ValueYourTradePageContent;
};

export type DedicatedPageContent = DedicatedPageContentBySlug[DedicatedPageSlug];

export function isDedicatedPageSlug(slug: string): slug is DedicatedPageSlug {
  return (DEDICATED_PAGE_SLUGS as readonly string[]).includes(slug);
}
