"use client";



import "@/app/homepage-visual.css";



import { PortalHeader } from "@/components/layout/PortalHeader";

import { renderHomepageSection } from "@/components/home/renderHomepageSection";

import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";

import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";

import { MobileStickyCTA } from "@/components/portal/MobileStickyCTA";

import {

  groupHomepageSectionsByZone,

  getVisibleHomepageSectionOrder,

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



function PortalContent({

  vehicles,

  communityHero,

  commitmentCms,

  socialFeedCms,

  facebookPage,

  facebookFeed,

  homepageLayout,

}: PortalExperienceProps) {

  const visibleOrder = getVisibleHomepageSectionOrder(homepageLayout);

  const blocks = groupHomepageSectionsByZone(visibleOrder);

  const ctx = {

    vehicles,

    communityHero,

    commitmentCms,

    socialFeedCms,

    facebookPage,

    facebookFeed,

  };



  return (

    <>

      <div className="homepage-surface">

        <PortalHeader />

        <div className="homepage-header-spacer" aria-hidden />

        {blocks.map((block, blockIndex) => {

          const nodes = block.sectionIds.map((id) => renderHomepageSection(id, ctx));

          if (block.zone === "lower") {

            return (

              <div key={`lower-${blockIndex}`} className="homepage-lower-continuum">

                {nodes}

              </div>

            );

          }

          return <div key={`main-${blockIndex}`}>{nodes}</div>;

        })}

      </div>

      <MobileStickyCTA />

      <div className="h-20 md:hidden" aria-hidden />

    </>

  );

}



export function PortalExperience(props: PortalExperienceProps) {

  return (

    <LeadCaptureProvider>

      <DiscoveryProvider>

        <PortalContent {...props} />

      </DiscoveryProvider>

    </LeadCaptureProvider>

  );

}


