import type { Metadata } from "next";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { ScheduleServiceView } from "@/components/service/ScheduleServiceView";
import { brandPageTitle, BRAND_NAME } from "@/lib/brand";
import { fetchServiceLocations } from "@/lib/serviceScheduling";
import { SCHEDULE_SERVICE_PAGE_CONTENT } from "@/lib/serviceSchedulingContent";

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
      <main className="min-h-screen bg-[var(--cream)]">
        <ScheduleServiceView locations={locations} />
      </main>
      <PortalFooter />
      <span className="sr-only">{SCHEDULE_SERVICE_PAGE_CONTENT.headline}</span>
    </LeadCaptureProvider>
  );
}
