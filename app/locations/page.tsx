import type { Metadata } from "next";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LocationsPageView } from "@/components/locations/LocationsPageView";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { brandPageTitle, BRAND_NAME } from "@/lib/brand";
import { fetchDealershipLocations } from "@/lib/locationsPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: brandPageTitle("Locations"),
  description: `Find ${BRAND_NAME} dealerships across South and Central Texas. View hours, directions, and contact information.`,
};

export default async function LocationsPage() {
  const locations = await fetchDealershipLocations();

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <LocationsPageView locations={locations} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
