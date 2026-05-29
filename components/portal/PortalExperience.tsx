"use client";

import "@/app/homepage-visual.css";
import dynamic from "next/dynamic";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { MobileStickyCTA } from "@/components/portal/MobileStickyCTA";
import {
  type HomepageLayoutConfig,
} from "@/lib/homepageLayout";
import type { FacebookFeedResult } from "@/lib/facebookFeedShared";
import type { FacebookPageConfig } from "@/lib/facebookPageConfig";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import type { CavenderCommitmentCmsPayload } from "@/lib/cavenderCommitmentTypes";
import type { SocialFeedCmsContent } from "@/lib/socialFeedTypes";
import type { Vehicle } from "@/lib/types";

interface PortalExperienceProps {
  vehicles: Vehicle[];
  communityHero: CommunityHeroContent;
  commitmentCms: CavenderCommitmentCmsPayload;
  socialFeedCms: SocialFeedCmsContent;
  facebookPage: FacebookPageConfig;
  facebookFeed: FacebookFeedResult | null;
  homepageLayout: HomepageLayoutConfig;
}

const HomepageHeroSection = dynamic(
  () =>
    import("@/components/home/HomepageHeroSection").then((m) => m.HomepageHeroSection),
  { ssr: false },
);
const DiscoveryCategoriesSection = dynamic(
  () =>
    import("@/components/home/DiscoveryCategoriesSection").then(
      (m) => m.DiscoveryCategoriesSection,
    ),
  { ssr: false },
);
const DrivenOffersSection = dynamic(
  () => import("@/components/home/DrivenOffersSection").then((m) => m.DrivenOffersSection),
  { ssr: false },
);
const GuidedDiscoverySection = dynamic(
  () => import("@/components/portal/GuidedDiscoverySection").then((m) => m.GuidedDiscoverySection),
  { ssr: false },
);
const CavenderCommitmentSection = dynamic(
  () =>
    import("@/components/home/CavenderCommitmentSection").then(
      (m) => m.CavenderCommitmentSection,
    ),
  { ssr: false },
);
const SocialFeedSection = dynamic(
  () => import("@/components/home/SocialFeedSection").then((m) => m.SocialFeedSection),
  { ssr: false },
);
const HomepageBottomScene = dynamic(
  () => import("@/components/home/HomepageBottomScene").then((m) => m.HomepageBottomScene),
  { ssr: false },
);
const ExploreOurBrandsSection = dynamic(
  () =>
    import("@/components/home/ExploreOurBrandsSection").then(
      (m) => m.ExploreOurBrandsSection,
    ),
  { ssr: false },
);

export function PortalExperience(props: PortalExperienceProps) {
  const hidden = new Set(props.homepageLayout.hiddenSections);

  return (
    <DiscoveryProvider>
      <div className="homepage-surface">
        <PortalHeader />
        <div className="homepage-header-spacer" aria-hidden />
        {!hidden.has("editorial_hero") ? (
          <HomepageHeroSection content={props.communityHero} />
        ) : null}
        {!hidden.has("discovery_categories") ? (
          <DiscoveryCategoriesSection vehicles={props.vehicles} />
        ) : null}
        {!hidden.has("driven_offers") ? <DrivenOffersSection /> : null}
        <div className="homepage-lower-continuum">
          {!hidden.has("guided_discovery") ? (
            <GuidedDiscoverySection vehicles={props.vehicles} />
          ) : null}
          {!hidden.has("cavender_commitment") ? (
            <CavenderCommitmentSection cms={props.commitmentCms} />
          ) : null}
          {!hidden.has("social_feed") ? (
            <SocialFeedSection
              page={props.facebookPage}
              graphFeed={props.facebookFeed}
              cms={props.socialFeedCms}
            />
          ) : null}
          {!hidden.has("homepage_bottom_scene") ? <HomepageBottomScene /> : null}
          {!hidden.has("explore_brands") ? <ExploreOurBrandsSection /> : null}
        </div>
        <PortalFooter />
      </div>
      <MobileStickyCTA />
      <div className="h-20 md:hidden" aria-hidden />
    </DiscoveryProvider>
  );
}

export default PortalExperience;
