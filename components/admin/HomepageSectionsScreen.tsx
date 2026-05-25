import Link from "next/link";
import { HomepageSectionsEditor } from "@/components/admin/HomepageSectionsEditor";
import { listHomepageSectionsAdmin } from "@/lib/homepageSectionsAdmin";
import { listCollectionsAdmin } from "@/lib/collectionsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function HomepageSectionsScreen() {
  const configured = isSupabaseAdminConfigured();
  let rows: Awaited<ReturnType<typeof listHomepageSectionsAdmin>> = [];
  let collections: { id: string; name: string }[] = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      const [sectionRows, collectionRows] = await Promise.all([
        listHomepageSectionsAdmin(),
        listCollectionsAdmin(),
      ]);
      rows = sectionRows;
      collections = collectionRows.map((c) => ({ id: c.id, name: c.name }));
    } catch (error: unknown) {
      loadError =
        error instanceof Error ? error.message : "Failed to load sections";
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Homepage Sections</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Manage <code className="rounded bg-[var(--cream)] px-1 text-xs">homepage_sections</code>{" "}
          for inventory rails and featured blocks. Does not replace{" "}
          <Link href="/admin/pages" className="underline">
            Site pages
          </Link>{" "}
          CMS.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to manage homepage sections.
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      <HomepageSectionsEditor initialRows={rows} collections={collections} />
    </div>
  );
}
