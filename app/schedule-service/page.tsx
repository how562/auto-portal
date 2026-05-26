import type { Metadata } from "next";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { ScheduleServiceView } from "@/components/service/ScheduleServiceView";
import { brandPageTitle, BRAND_NAME } from "@/lib/brand";
import { fetchServiceLocations } from "@/lib/serviceScheduling";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: brandPageTitle("Schedule Service"),
  description: `Schedule service online or call the service department at any ${BRAND_NAME} dealership.`,
};

export default async function ScheduleServicePage() {
  const locations = await fetchServiceLocations();

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <ScheduleServiceView locations={locations} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
