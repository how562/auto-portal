import { notFound } from "next/navigation";
import { DedicatedPageContentEditor } from "@/components/admin/dedicated-page/DedicatedPageContentEditor";
import { PageBuilder } from "@/components/admin/PageBuilder";
import {
  fetchAllPageSectionsForAdmin,
  fetchSitePageById,
} from "@/lib/cmsAdmin";
import { listCollectionsAdmin } from "@/lib/collectionsAdmin";
import { isDedicatedPageSlug } from "@/lib/dedicatedPageContent";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { pageId: string };
}

export default async function AdminPageBuilderPage({ params }: PageProps) {
  if (!isSupabaseAdminConfigured()) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to edit pages.
      </p>
    );
  }

  const page = await fetchSitePageById(params.pageId);
  if (!page) notFound();

  if (isDedicatedPageSlug(page.slug)) {
    return <DedicatedPageContentEditor pageId={params.pageId} page={page} />;
  }

  const [sections, collections] = await Promise.all([
    fetchAllPageSectionsForAdmin(params.pageId),
    listCollectionsAdmin().catch(() => []),
  ]);

  const collectionOptions = collections.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <PageBuilder
      pageId={params.pageId}
      page={page}
      initialSections={sections}
      collections={collectionOptions}
    />
  );
}
