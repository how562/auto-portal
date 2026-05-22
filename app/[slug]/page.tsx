import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CMSSectionRenderer } from "@/components/cms/CMSSectionRenderer";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { brandPageTitle } from "@/lib/brand";
import { RESERVED_CMS_SLUGS } from "@/lib/cmsTypes";
import { fetchEnrichedCMSPage, fetchPublishedPageBySlug } from "@/lib/cmsPages";
import { fetchStores } from "@/lib/stores";

export const dynamic = "force-dynamic";

interface CMSPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: CMSPageProps): Promise<Metadata> {
  const { slug } = params;

  if (RESERVED_CMS_SLUGS.has(slug)) {
    return {};
  }

  const page = await fetchPublishedPageBySlug(slug);
  if (!page) {
    return { title: brandPageTitle("Page not found") };
  }

  return {
    title: brandPageTitle(page.title),
    description: page.meta_description ?? undefined,
  };
}

export default async function CMSPage({ params }: CMSPageProps) {
  const { slug } = params;

  if (RESERVED_CMS_SLUGS.has(slug)) {
    notFound();
  }

  const data = await fetchEnrichedCMSPage(slug);
  if (!data) {
    notFound();
  }

  const stores = await fetchStores();

  return (
    <DiscoveryProvider>
      <LeadCaptureProvider>
        <PortalHeader />
        <main className="min-h-screen bg-[var(--cream)] pt-20 sm:pt-24">
          <CMSSectionRenderer sections={data.sections} />
        </main>
        <PortalFooter stores={stores} />
      </LeadCaptureProvider>
    </DiscoveryProvider>
  );
}
