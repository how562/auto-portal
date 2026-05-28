import type { Metadata } from "next";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { FinancePageView } from "@/components/finance/FinancePageView";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import { fetchPublishedDedicatedPageContent } from "@/lib/dedicatedPageContent";
import { dedicatedPageMetadata } from "@/lib/dedicatedPageMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dedicatedPageMetadata("finance-center", {
    title: "Finance Center",
    description: `Apply for financing online at any ${BRAND_NAME} dealership across South and Central Texas.`,
  });
}

export default async function FinanceCenterPage() {
  const content = await fetchPublishedDedicatedPageContent("finance-center");

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <FinancePageView content={content} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
