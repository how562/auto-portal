import { CavenderCommitmentSection } from "@/components/home/CavenderCommitmentSection";
import { DiscoveryCategoriesSection } from "@/components/home/DiscoveryCategoriesSection";
import { DrivenOffersSection } from "@/components/home/DrivenOffersSection";
import { EditorialHero } from "@/components/home/EditorialHero";
import { ExploreOurBrandsSection } from "@/components/home/ExploreOurBrandsSection";
import { HomepageBottomScene } from "@/components/home/HomepageBottomScene";
import { PortalFooter } from "@/components/home/PortalFooter";
import { SocialFeedSection } from "@/components/home/SocialFeedSection";
import { GuidedDiscoverySection } from "@/components/portal/GuidedDiscoverySection";
import type { FacebookFeedResult } from "@/lib/facebookFeedShared";
import type { FacebookPageConfig } from "@/lib/facebookPageConfig";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import type { CavenderCommitmentCmsPayload } from "@/lib/cavenderCommitmentTypes";
import type { SocialFeedCmsContent } from "@/lib/socialFeedTypes";
import type { HomepageLayoutSectionId } from "@/lib/homepageLayoutRegistry";
import type { Vehicle } from "@/lib/types";

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
      return <EditorialHero key={id} content={ctx.communityHero} />;
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
      return <PortalFooter key={id} />;
    default:
      return null;
  }
}
