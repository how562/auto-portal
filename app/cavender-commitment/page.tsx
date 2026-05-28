import type { Metadata } from "next";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { CavenderCommitmentPageView } from "@/components/commitment/CavenderCommitmentPageView";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import { fetchPublishedDedicatedPageContent } from "@/lib/dedicatedPageContent";
import { dedicatedPageMetadata } from "@/lib/dedicatedPageMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dedicatedPageMetadata("cavender-commitment", {
    title: "Cavender Commitment",
    description: `Free oil changes for life for veterans and active-duty military at ${BRAND_NAME}. Learn about the Cavender Commitment program.`,
  });
}

export default async function CavenderCommitmentPage() {
  const content = await fetchPublishedDedicatedPageContent("cavender-commitment");

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <CavenderCommitmentPageView content={content} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
