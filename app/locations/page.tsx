import type { Metadata } from "next";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LocationsPageView } from "@/components/locations/LocationsPageView";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import { fetchPublishedDedicatedPageContent } from "@/lib/dedicatedPageContent";
import { dedicatedPageMetadata } from "@/lib/dedicatedPageMetadata";
import { fetchDealershipLocations } from "@/lib/locationsPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dedicatedPageMetadata("locations", {
    title: "Locations",
    description: `Find ${BRAND_NAME} dealerships across South and Central Texas. View hours, directions, and contact information.`,
  });
}

export default async function LocationsPage() {
  const [locations, content] = await Promise.all([
    fetchDealershipLocations(),
    fetchPublishedDedicatedPageContent("locations"),
  ]);

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <LocationsPageView locations={locations} content={content} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
