import Link from "next/link";
import { notFound } from "next/navigation";
import { CMSSectionRenderer } from "@/components/cms/CMSSectionRenderer";
import { PortalFooter } from "@/components/home/PortalFooter";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { fetchSitePageById } from "@/lib/cmsAdmin";
import { fetchEnrichedCMSPageForPreview } from "@/lib/cmsPages";
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

  const data = await fetchEnrichedCMSPageForPreview(params.pageId);
  const sections = data?.sections ?? [];

  return (
    <DiscoveryProvider>
      <LeadCaptureProvider>
        <div className="sticky top-0 z-[60] border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
          <div className="portal-container flex flex-wrap items-center justify-between gap-2">
            <span>
              Preview: <strong>{page.title}</strong> · {page.status}
              {page.status !== "published" ? " (draft — not public)" : null}
            </span>
            <div className="flex gap-3">
              <Link href={`/admin/pages/${page.id}`} className="font-medium underline">
                Edit page
              </Link>
              {page.status === "published" ? (
                <Link
                  href={`/${page.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline"
                >
                  Live /{page.slug}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
        <PortalHeader />
        <main className="min-h-screen bg-[var(--cream)] pt-20 sm:pt-24">
          <CMSSectionRenderer sections={sections} />
        </main>
        <PortalFooter />
      </LeadCaptureProvider>
    </DiscoveryProvider>
  );
}
