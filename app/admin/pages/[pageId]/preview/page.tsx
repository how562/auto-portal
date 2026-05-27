import Link from "next/link";
import { notFound } from "next/navigation";
import { CMSSectionRenderer } from "@/components/cms/CMSSectionRenderer";
import { ExecutiveTeamPageView } from "@/components/executive/ExecutiveTeamPageView";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { LocationsPageView } from "@/components/locations/LocationsPageView";
import { AboutUsPage } from "@/components/pages/AboutUsPage";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { ScheduleServiceView } from "@/components/service/ScheduleServiceView";
import { ValueYourTradePageView } from "@/components/value-your-trade/ValueYourTradePageView";
import { fetchSitePageById } from "@/lib/cmsAdmin";
import {
  fetchAdminDedicatedPageContent,
  isDedicatedPageSlug,
} from "@/lib/dedicatedPageContent";
import { getDedicatedSitePage } from "@/lib/dedicatedSitePages";
import { fetchEnrichedCMSPageForPreview } from "@/lib/cmsPages";
import { fetchDealershipLocations } from "@/lib/locationsPage";
import { fetchServiceLocations } from "@/lib/serviceScheduling";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { pageId: string };
}

export default async function AdminPagePreviewPage({ params }: PageProps) {
  if (!isSupabaseAdminConfigured()) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to preview pages.
      </p>
    );
  }

  const page = await fetchSitePageById(params.pageId);
  if (!page) notFound();

  const dedicated = isDedicatedPageSlug(page.slug)
    ? getDedicatedSitePage(page.slug)
    : undefined;

  const dedicatedContent = dedicated
    ? await fetchAdminDedicatedPageContent(page.id)
    : null;

  const data = dedicated ? null : await fetchEnrichedCMSPageForPreview(params.pageId);
  const sections = data?.sections ?? [];

  const liveHref = dedicated?.livePath ?? `/${page.slug}`;

  return (
    <DiscoveryProvider>
      <LeadCaptureProvider>
        <div className="sticky top-0 z-[60] border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
          <div className="portal-container flex flex-wrap items-center justify-between gap-2">
            <span>
              Preview: <strong>{page.title}</strong> · {page.status}
              {page.status !== "published" ? " (draft — not public until published)" : null}
            </span>
            <div className="flex gap-3">
              <Link href={`/admin/pages/${page.id}`} className="font-medium underline">
                Edit page
              </Link>
              <Link href={liveHref} target="_blank" rel="noreferrer" className="font-medium underline">
                {dedicated ? "Live page" : `Live /${page.slug}`}
              </Link>
            </div>
          </div>
        </div>
        <PortalHeader />
        <main
          className={
            dedicated
              ? "min-h-screen bg-white pt-[4.125rem] sm:pt-[4.625rem]"
              : "min-h-screen bg-[var(--cream)] pt-20 sm:pt-24"
          }
        >
          {dedicated && dedicatedContent ? (
            <DedicatedPreview slug={page.slug} content={dedicatedContent.content} />
          ) : (
            <CMSSectionRenderer sections={sections} />
          )}
        </main>
        <PortalFooter />
      </LeadCaptureProvider>
    </DiscoveryProvider>
  );
}

async function DedicatedPreview({
  slug,
  content,
}: {
  slug: string;
  content: import("@/lib/dedicatedPageContent").DedicatedPageContent;
}) {
  switch (slug) {
    case "about-us":
      return (
        <AboutUsPage content={content as import("@/lib/aboutUsPageContent").AboutUsPageContent} />
      );
    case "locations": {
      const locations = await fetchDealershipLocations();
      return (
        <LocationsPageView
          locations={locations}
          content={content as import("@/lib/locationsPageTypes").LocationsPageContent}
        />
      );
    }
    case "schedule-service": {
      const locations = await fetchServiceLocations();
      return (
        <ScheduleServiceView
          locations={locations}
          content={
            content as import("@/lib/serviceSchedulingTypes").ScheduleServicePageContent
          }
        />
      );
    }
    case "executive-team":
      return (
        <ExecutiveTeamPageView
          content={content as import("@/lib/executiveTeamPageContent").ExecutiveTeamPageContent}
        />
      );
    case "value-your-trade":
      return (
        <ValueYourTradePageView
          content={content as import("@/lib/valueYourTradePageContent").ValueYourTradePageContent}
        />
      );
    default:
      return null;
  }
}
