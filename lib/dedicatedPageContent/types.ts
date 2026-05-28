import type { ContactTheCavendersPageContent } from "@/lib/contactTheCavendersPageContent";
import type { CavenderCaresPageContent } from "@/lib/cavenderCaresPageContent";
import type { CavenderCommitmentPageContent } from "@/lib/cavenderCommitmentPageContent";
import type { AboutUsPageContent } from "@/lib/aboutUsPageContent";
import type { ExecutiveTeamPageContent } from "@/lib/executiveTeamPageContent";
import type { LocationsPageContent } from "@/lib/locationsPageTypes";
import type { ScheduleServicePageContent } from "@/lib/serviceSchedulingTypes";
import type { FinancePageContent } from "@/lib/financePageContent";
import type { OurStoryPageContent } from "@/lib/ourStoryPageContent";
import type { ValueYourTradePageContent } from "@/lib/valueYourTradePageContent";

export const DEDICATED_PAGE_SLUGS = [
  "about-us",
  "locations",
  "schedule-service",
  "executive-team",
  "value-your-trade",
  "cavender-commitment",
  "cavender-cares",
  "finance-center",
  "our-story",
  "contact-the-cavenders",
] as const;

export type DedicatedPageSlug = (typeof DEDICATED_PAGE_SLUGS)[number];

export type DedicatedPageContentBySlug = {
  "about-us": AboutUsPageContent;
  locations: LocationsPageContent;
  "schedule-service": ScheduleServicePageContent;
  "executive-team": ExecutiveTeamPageContent;
  "value-your-trade": ValueYourTradePageContent;
  "cavender-commitment": CavenderCommitmentPageContent;
  "cavender-cares": CavenderCaresPageContent;
  "finance-center": FinancePageContent;
  "our-story": OurStoryPageContent;
  "contact-the-cavenders": ContactTheCavendersPageContent;
};

export type DedicatedPageContent = DedicatedPageContentBySlug[DedicatedPageSlug];

export function isDedicatedPageSlug(slug: string): slug is DedicatedPageSlug {
  return (DEDICATED_PAGE_SLUGS as readonly string[]).includes(slug);
}
