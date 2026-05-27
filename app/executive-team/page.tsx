import type { Metadata } from "next";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { ExecutiveTeamPageView } from "@/components/executive/ExecutiveTeamPageView";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import { fetchPublishedDedicatedPageContent } from "@/lib/dedicatedPageContent";
import { dedicatedPageMetadata } from "@/lib/dedicatedPageMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dedicatedPageMetadata("executive-team", {
    title: "Executive Team",
    description: `Meet the executive leadership team at ${BRAND_NAME} — experienced leaders committed to customers, team members, and community.`,
  });
}

export default async function ExecutiveTeamPage() {
  const content = await fetchPublishedDedicatedPageContent("executive-team");

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <ExecutiveTeamPageView content={content} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
