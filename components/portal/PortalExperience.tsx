"use client";

import { CavenderCommitmentSection } from "@/components/home/CavenderCommitmentSection";
import { DiscoveryCategoriesSection } from "@/components/home/DiscoveryCategoriesSection";
import { EditorialHero } from "@/components/home/EditorialHero";
import { HomepageInventorySearchBridge } from "@/components/home/HomepageInventorySearchBridge";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { ExploreOurBrandsSection } from "@/components/home/ExploreOurBrandsSection";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { GuidedDiscoverySection } from "@/components/portal/GuidedDiscoverySection";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { MobileStickyCTA } from "@/components/portal/MobileStickyCTA";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import type { CavenderCommitmentCmsPayload } from "@/lib/cavenderCommitmentTypes";
import type { Vehicle } from "@/lib/types";

interface PortalExperienceProps {
  vehicles: Vehicle[];
  communityHero: CommunityHeroContent;
  commitmentCms: CavenderCommitmentCmsPayload;
}

function PortalContent({
  vehicles,
  communityHero,
  commitmentCms,
}: PortalExperienceProps) {
  return (
    <>
      <PortalHeader />
      <EditorialHero content={communityHero} />
      <HomepageInventorySearchBridge />
      <DiscoveryCategoriesSection vehicles={vehicles} />
      <GuidedDiscoverySection vehicles={vehicles} />
      <CavenderCommitmentSection cms={commitmentCms} />
      <HowItWorksSection />
      <ExploreOurBrandsSection />
      <PortalFooter />
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
