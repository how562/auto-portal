"use client";

import { DiscoveryCategoriesSection } from "@/components/home/DiscoveryCategoriesSection";
import { EditorialHero } from "@/components/home/EditorialHero";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { InventoryRailsSection } from "@/components/home/InventoryRailsSection";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { StoreBrandStrip } from "@/components/home/StoreBrandStrip";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { GuidedDiscoverySection } from "@/components/portal/GuidedDiscoverySection";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { MobileStickyCTA } from "@/components/portal/MobileStickyCTA";
import type {
  HomepageSectionData,
  Store,
  Vehicle,
} from "@/lib/types";

interface PortalExperienceProps {
  sections: HomepageSectionData[];
  vehicles: Vehicle[];
  stores: Store[];
  loadError: string | null;
}

function PortalContent({
  sections,
  vehicles,
  stores,
  loadError,
}: PortalExperienceProps) {
  return (
    <>
      <PortalHeader />
      <EditorialHero previewVehicles={vehicles} />
      <DiscoveryCategoriesSection vehicles={vehicles} />
      <GuidedDiscoverySection vehicles={vehicles} />
      <InventoryRailsSection
        vehicles={vehicles}
        sections={sections}
        loadError={loadError}
      />
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
    <DiscoveryProvider>
      <LeadCaptureProvider>
        <PortalContent {...props} />
      </LeadCaptureProvider>
    </DiscoveryProvider>
  );
}
