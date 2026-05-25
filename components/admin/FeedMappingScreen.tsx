import { FeedMappingEditor } from "@/components/admin/FeedMappingEditor";
import { listFeedFileMappingsAdmin } from "@/lib/feedFileMappingsAdmin";
import { listStoresForAdmin } from "@/lib/storesAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function FeedMappingScreen() {
  const configured = isSupabaseAdminConfigured();
  let rows: Awaited<ReturnType<typeof listFeedFileMappingsAdmin>> = [];
  let stores: Awaited<ReturnType<typeof listStoresForAdmin>> = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      [rows, stores] = await Promise.all([
        listFeedFileMappingsAdmin(),
        listStoresForAdmin(),
      ]);
    } catch (error: unknown) {
      loadError =
        error instanceof Error ? error.message : "Failed to load feed mappings";
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Feed Mapping</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Map HomeNet SFTP filenames to stores. Active rows in{" "}
          <code className="rounded bg-[var(--cream)] px-1.5 py-0.5 text-xs">
            feed_file_mappings
          </code>{" "}
          are used before environment variables or filename heuristics.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to manage feed mappings.
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      <FeedMappingEditor initialRows={rows} stores={stores} />
    </div>
  );
}
