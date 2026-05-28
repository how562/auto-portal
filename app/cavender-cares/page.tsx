import type { Metadata } from "next";
import { CavenderCaresPageView } from "@/components/cares/CavenderCaresPageView";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import { fetchPublishedDedicatedPageContent } from "@/lib/dedicatedPageContent";
import { dedicatedPageMetadata } from "@/lib/dedicatedPageMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dedicatedPageMetadata("cavender-cares", {
    title: "Cavender Cares",
    description: `${BRAND_NAME} philanthropic branch — community giving, partnerships, and impact across San Antonio and Boerne.`,
  });
}

export default async function CavenderCaresPage() {
  const content = await fetchPublishedDedicatedPageContent("cavender-cares");

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <CavenderCaresPageView content={content} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
