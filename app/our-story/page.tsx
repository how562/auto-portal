import type { Metadata } from "next";
import { OurStoryPageView } from "@/components/our-story/OurStoryPageView";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import { fetchPublishedDedicatedPageContent } from "@/lib/dedicatedPageContent";
import { dedicatedPageMetadata } from "@/lib/dedicatedPageMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dedicatedPageMetadata("our-story", {
    title: "Our Story",
    description: `Over 85 years of family, community, and automotive excellence at ${BRAND_NAME}. Explore the Cavender legacy.`,
  });
}

export default async function OurStoryPage() {
  const content = await fetchPublishedDedicatedPageContent("our-story");

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <OurStoryPageView content={content} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
