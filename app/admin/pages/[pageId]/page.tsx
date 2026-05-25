import { notFound } from "next/navigation";
import { PageBuilder } from "@/components/admin/PageBuilder";
import {
  fetchAllPageSectionsForAdmin,
  fetchSitePageById,
} from "@/lib/cmsAdmin";
import { listCollectionsAdmin } from "@/lib/collectionsAdmin";
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
      page={page}
      initialSections={sections}
      collections={collectionOptions}
    />
  );
}
