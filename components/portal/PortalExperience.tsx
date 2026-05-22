"use client";

import { CavenderCommitmentSection } from "@/components/home/CavenderCommitmentSection";
import { DiscoveryCategoriesSection } from "@/components/home/DiscoveryCategoriesSection";
import { EditorialHero } from "@/components/home/EditorialHero";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { StoreBrandStrip } from "@/components/home/StoreBrandStrip";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { GuidedDiscoverySection } from "@/components/portal/GuidedDiscoverySection";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { MobileStickyCTA } from "@/components/portal/MobileStickyCTA";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import type { CavenderCommitmentCmsPayload } from "@/lib/cavenderCommitmentTypes";
import type { Store, Vehicle } from "@/lib/types";

interface PortalExperienceProps {
  vehicles: Vehicle[];
  stores: Store[];
  communityHero: CommunityHeroContent;
  commitmentCms: CavenderCommitmentCmsPayload;
}

function PortalContent({
  vehicles,
  stores,
  communityHero,
  commitmentCms,
}: PortalExperienceProps) {
  return (
    <>
      <PortalHeader />
      <EditorialHero content={communityHero} />
      <DiscoveryCategoriesSection vehicles={vehicles} />
      <GuidedDiscoverySection vehicles={vehicles} />
      <CavenderCommitmentSection cms={commitmentCms} />
      <HowItWorksSection />
      <StoreBrandStrip stores={stores} />
      <PortalFooter stores={stores} />
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
