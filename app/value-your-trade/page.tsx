import type { Metadata } from "next";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { ValueYourTradePageView } from "@/components/value-your-trade/ValueYourTradePageView";
import { BRAND_NAME } from "@/lib/brand";
import { fetchPublishedDedicatedPageContent } from "@/lib/dedicatedPageContent";
import { dedicatedPageMetadata } from "@/lib/dedicatedPageMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dedicatedPageMetadata("value-your-trade", {
    title: "Value Your Trade",
    description: `Get a trade-in value for your vehicle with ${BRAND_NAME}. Quick online offers from our trusted partner.`,
  });
}

export default async function ValueYourTradePage() {
  const content = await fetchPublishedDedicatedPageContent("value-your-trade");

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <ValueYourTradePageView content={content} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
