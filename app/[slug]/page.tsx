import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CMSSectionRenderer } from "@/components/cms/CMSSectionRenderer";
import { AboutUsPage } from "@/components/pages/AboutUsPage";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { brandPageTitle } from "@/lib/brand";
import { pageUsesHeaderHero } from "@/lib/cmsPageHeaderLayout";
import { RESERVED_CMS_SLUGS } from "@/lib/cmsTypes";
import { fetchEnrichedCMSPage, fetchPublishedPageBySlug } from "@/lib/cmsPages";

import "@/app/cms-page.css";

export const dynamic = "force-dynamic";

interface CMSPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: CMSPageProps): Promise<Metadata> {
  const { slug } = params;

  if (slug === "mathbox-settings") {
    return { title: "Math Box Settings" };
  }

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

  if (slug === "mathbox-settings") {
    redirect("/admin/mathbox-settings");
  }

  if (RESERVED_CMS_SLUGS.has(slug)) {
    notFound();
  }

  const data = await fetchEnrichedCMSPage(slug);
  if (!data) {
    notFound();
  }

  const isAboutUs = slug === "about-us";
  const usesPageHeader = !isAboutUs && pageUsesHeaderHero(data.sections, slug);

  return (
    <DiscoveryProvider>
      <LeadCaptureProvider>
        <PortalHeader />
        <main
          className={
            isAboutUs || usesPageHeader
              ? "min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]"
              : "min-h-screen bg-[var(--cream)] pt-20 sm:pt-24"
          }
        >
          {isAboutUs ? (
            <AboutUsPage />
          ) : (
            <CMSSectionRenderer
              sections={data.sections}
              pageTitle={data.page.title}
              pageSlug={slug}
            />
          )}
        </main>
        <PortalFooter />
      </LeadCaptureProvider>
    </DiscoveryProvider>
  );
}
