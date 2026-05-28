import type { Metadata } from "next";
import { ContactTheCavendersPageView } from "@/components/contact/ContactTheCavendersPageView";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { BRAND_NAME } from "@/lib/brand";
import { fetchPublishedDedicatedPageContent } from "@/lib/dedicatedPageContent";
import { dedicatedPageMetadata } from "@/lib/dedicatedPageMetadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dedicatedPageMetadata("contact-the-cavenders", {
    title: "Contact The Cavenders",
    description: `Reach Rob and Lee Cavender directly with feedback, questions, or concerns — ${BRAND_NAME} leadership is listening.`,
  });
}

export default async function ContactTheCavendersPage() {
  const content = await fetchPublishedDedicatedPageContent("contact-the-cavenders");

  return (
    <LeadCaptureProvider>
      <PortalHeader />
      <main className="min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]">
        <ContactTheCavendersPageView content={content} />
      </main>
      <PortalFooter />
    </LeadCaptureProvider>
  );
}
