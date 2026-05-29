/* eslint-disable @next/next/no-async-client-component */
"use client";

import dynamic from "next/dynamic";
import type { FacebookFeedResult } from "@/lib/facebookFeedShared";
import type { FacebookPageConfig } from "@/lib/facebookPageConfig";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import type { CavenderCommitmentCmsPayload } from "@/lib/cavenderCommitmentTypes";
import type { SocialFeedCmsContent } from "@/lib/socialFeedTypes";
import type { HomepageLayoutSectionId } from "@/lib/homepageLayoutRegistry";
import type { Vehicle } from "@/lib/types";

async function loadNamedComponent<T extends Record<string, unknown>>(
  loader: () => Promise<T>,
  key: keyof T,
): Promise<T[keyof T]> {
  const mod = await loader();
  const resolved = mod[key];
  if (!resolved) {
    throw new Error(`Homepage section export is undefined: ${String(key)}`);
  }
  return resolved;
}

const HomepageHeroSection = dynamic(
  () =>
    loadNamedComponent(
      () => import("@/components/home/HomepageHeroSection"),
      "HomepageHeroSection",
    ),
  { ssr: false },
);
const DiscoveryCategoriesSection = dynamic(
  () => loadNamedComponent(
      () => import("@/components/home/DiscoveryCategoriesSection"),
      "DiscoveryCategoriesSection",
    ),
  { ssr: false },
);
const DrivenOffersSection = dynamic(
  () =>
    loadNamedComponent(
      () => import("@/components/home/DrivenOffersSection"),
      "DrivenOffersSection",
    ),
  { ssr: false },
);
const GuidedDiscoverySection = dynamic(
  () =>
    loadNamedComponent(
      () => import("@/components/portal/GuidedDiscoverySection"),
      "GuidedDiscoverySection",
    ),
  { ssr: false },
);
const CavenderCommitmentSection = dynamic(
  () => loadNamedComponent(
      () => import("@/components/home/CavenderCommitmentSection"),
      "CavenderCommitmentSection",
    ),
  { ssr: false },
);
const SocialFeedSection = dynamic(
  () =>
    loadNamedComponent(
      () => import("@/components/home/SocialFeedSection"),
      "SocialFeedSection",
    ),
  { ssr: false },
);
const HomepageBottomScene = dynamic(
  () =>
    loadNamedComponent(
      () => import("@/components/home/HomepageBottomScene"),
      "HomepageBottomScene",
    ),
  { ssr: false },
);
const ExploreOurBrandsSection = dynamic(
  () => loadNamedComponent(
      () => import("@/components/home/ExploreOurBrandsSection"),
      "ExploreOurBrandsSection",
    ),
  { ssr: false },
);


export interface HomepageSectionRenderContext {
  vehicles: Vehicle[];
  communityHero: CommunityHeroContent;
  commitmentCms: CavenderCommitmentCmsPayload;
  socialFeedCms: SocialFeedCmsContent;
  facebookPage: FacebookPageConfig;
  facebookFeed: FacebookFeedResult | null;
}

export function renderHomepageSection(
  id: HomepageLayoutSectionId,
  ctx: HomepageSectionRenderContext,
) {
  switch (id) {
    case "editorial_hero":
      return <HomepageHeroSection key={id} content={ctx.communityHero} />;
    case "discovery_categories":
      return <DiscoveryCategoriesSection key={id} vehicles={ctx.vehicles} />;
    case "driven_offers":
      return <DrivenOffersSection key={id} />;
    case "guided_discovery":
      return <GuidedDiscoverySection key={id} vehicles={ctx.vehicles} />;
    case "cavender_commitment":
      return <CavenderCommitmentSection key={id} cms={ctx.commitmentCms} />;
    case "social_feed":
      return (
        <SocialFeedSection
          key={id}
          page={ctx.facebookPage}
          graphFeed={ctx.facebookFeed}
          cms={ctx.socialFeedCms}
        />
      );
    case "homepage_bottom_scene":
      return <HomepageBottomScene key={id} />;
    case "explore_brands":
      return <ExploreOurBrandsSection key={id} />;
    case "portal_footer":
      return null;
    default:
      return null;
  }
}
