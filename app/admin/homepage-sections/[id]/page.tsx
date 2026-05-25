import { notFound } from "next/navigation";
import { HomepageSectionEditForm } from "@/components/admin/HomepageSectionEditForm";
import { listCollectionsAdmin } from "@/lib/collectionsAdmin";
import { getHomepageSectionAdmin } from "@/lib/homepageSectionsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminHomepageSectionEditPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseAdminConfigured()) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to edit sections.
      </p>
    );
  }

  let section: Awaited<ReturnType<typeof getHomepageSectionAdmin>> = null;
  let collections: { id: string; name: string }[] = [];

  try {
    const [row, collectionRows] = await Promise.all([
      getHomepageSectionAdmin(id),
      listCollectionsAdmin(),
    ]);
    section = row;
    collections = collectionRows.map((c) => ({ id: c.id, name: c.name }));
  } catch {
    /* notFound below */
  }

  if (!section) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Edit section</h1>
      <HomepageSectionEditForm section={section} collections={collections} />
    </div>
  );
}
