import { notFound } from "next/navigation";
import { CollectionDetailForm } from "@/components/admin/CollectionDetailForm";
import { getCollectionAdmin } from "@/lib/collectionsAdmin";
import { listStoresForAdmin } from "@/lib/storesAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCollectionDetailPage({ params }: PageProps) {
  const { id } = await params;

  if (!isSupabaseAdminConfigured()) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to edit collections.
      </p>
    );
  }

  let collection: Awaited<ReturnType<typeof getCollectionAdmin>> = null;
  let stores: Awaited<ReturnType<typeof listStoresForAdmin>> = [];

  try {
    [collection, stores] = await Promise.all([
      getCollectionAdmin(id),
      listStoresForAdmin(),
    ]);
  } catch {
    /* notFound */
  }

  if (!collection) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{collection.name}</h1>
      <CollectionDetailForm collection={collection} stores={stores} />
    </div>
  );
}
