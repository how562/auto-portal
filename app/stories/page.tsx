import type { Metadata } from "next";
import { StoriesPageView } from "@/components/stories/StoriesPageView";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import { fetchPublishedStories } from "@/lib/storiesRepository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Stories | ${BRAND_NAME}`,
  description:
    "People, places, vehicles, and moments from across Cavender Auto Group — editorial stories from our community.",
};

export default async function StoriesPage() {
  const stories = await fetchPublishedStories();

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-[#0c0c0c] pt-[4.125rem] sm:pt-[4.625rem]">
        <StoriesPageView stories={stories} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
