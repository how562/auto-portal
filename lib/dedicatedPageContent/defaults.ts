import { CAVENDER_COMMITMENT_PAGE_CONTENT } from "@/lib/cavenderCommitmentPageContent";
import { ABOUT_US_PAGE_CONTENT } from "@/lib/aboutUsPageContent";
import { EXECUTIVE_TEAM_PAGE_CONTENT } from "@/lib/executiveTeamPageContent";
import { LOCATIONS_PAGE_CONTENT } from "@/lib/locationsPageContent";
import { SCHEDULE_SERVICE_PAGE_CONTENT } from "@/lib/serviceSchedulingContent";
import { FINANCE_PAGE_CONTENT } from "@/lib/financePageContent";
import { VALUE_YOUR_TRADE_PAGE_CONTENT } from "@/lib/valueYourTradePageContent";
import type {
  DedicatedPageContent,
  DedicatedPageContentBySlug,
  DedicatedPageSlug,
} from "@/lib/dedicatedPageContent/types";

export function getDefaultDedicatedPageContent<S extends DedicatedPageSlug>(
  slug: S,
): DedicatedPageContentBySlug[S] {
  switch (slug) {
    case "about-us":
      return structuredClone(ABOUT_US_PAGE_CONTENT) as DedicatedPageContentBySlug[S];
    case "locations":
      return structuredClone(LOCATIONS_PAGE_CONTENT) as DedicatedPageContentBySlug[S];
    case "schedule-service":
      return structuredClone(
        SCHEDULE_SERVICE_PAGE_CONTENT,
      ) as DedicatedPageContentBySlug[S];
    case "executive-team":
      return structuredClone(
        EXECUTIVE_TEAM_PAGE_CONTENT,
      ) as DedicatedPageContentBySlug[S];
    case "value-your-trade":
      return structuredClone(
        VALUE_YOUR_TRADE_PAGE_CONTENT,
      ) as DedicatedPageContentBySlug[S];
    case "cavender-commitment":
      return structuredClone(
        CAVENDER_COMMITMENT_PAGE_CONTENT,
      ) as DedicatedPageContentBySlug[S];
    case "finance-center":
      return structuredClone(FINANCE_PAGE_CONTENT) as DedicatedPageContentBySlug[S];
    default: {
      const _exhaustive: never = slug;
      return _exhaustive;
    }
  }
}

export function getDefaultDedicatedPageContentUntyped(
  slug: DedicatedPageSlug,
): DedicatedPageContent {
  return getDefaultDedicatedPageContent(slug);
}
