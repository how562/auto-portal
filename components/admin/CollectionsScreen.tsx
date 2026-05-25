import { CollectionsEditor } from "@/components/admin/CollectionsEditor";
import { listCollectionsAdmin } from "@/lib/collectionsAdmin";
import { listStoresForAdmin } from "@/lib/storesAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function CollectionsScreen() {
  const configured = isSupabaseAdminConfigured();
  let rows: Awaited<ReturnType<typeof listCollectionsAdmin>> = [];
  let stores: Awaited<ReturnType<typeof listStoresForAdmin>> = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      [rows, stores] = await Promise.all([
        listCollectionsAdmin(),
        listStoresForAdmin(),
      ]);
    } catch (error: unknown) {
      loadError =
        error instanceof Error ? error.message : "Failed to load collections";
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Smart inventory groupings with optional filter rules. Used by homepage
          sections and CMS collection blocks when those features are enabled.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to manage collections.
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      <CollectionsEditor initialRows={rows} stores={stores} />
    </div>
  );
}
