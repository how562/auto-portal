import Link from "next/link";
import { HomepageLayoutEditor } from "@/components/admin/HomepageLayoutEditor";
import { HomepageSectionsEditor } from "@/components/admin/HomepageSectionsEditor";
import { fetchHomepageLayoutAdmin } from "@/lib/homepageLayoutAdmin";
import { listHomepageSectionsAdmin } from "@/lib/homepageSectionsAdmin";
import { listCollectionsAdmin } from "@/lib/collectionsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";
import "@/app/admin/homepage-layout.css";

export async function HomepageAdminScreen() {
  const configured = isSupabaseAdminConfigured();
  let layout = null as Awaited<ReturnType<typeof fetchHomepageLayoutAdmin>> | null;
  let rails: Awaited<ReturnType<typeof listHomepageSectionsAdmin>> = [];
  let collections: { id: string; name: string }[] = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      const [layoutData, sectionRows, collectionRows] = await Promise.all([
        fetchHomepageLayoutAdmin(),
        listHomepageSectionsAdmin(),
        listCollectionsAdmin(),
      ]);
      layout = layoutData;
      rails = sectionRows;
      collections = collectionRows.map((c) => ({ id: c.id, name: c.name }));
    } catch (error: unknown) {
      loadError = error instanceof Error ? error.message : "Failed to load homepage";
    }
  }

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Homepage</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          Control the live homepage section stack — order, visibility, and previews match what
          visitors see on{" "}
          <Link href="/" className="font-medium text-[var(--ink)] underline">
            /
          </Link>
          . Inventory collection rails (legacy) are configured separately below.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to manage the homepage.
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      {layout ? <HomepageLayoutEditor initialLayout={layout} /> : null}

      <section className="border-t border-[var(--line)] pt-10">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Inventory collection rails</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            Optional vehicle rails from{" "}
            <code className="rounded bg-[var(--cream)] px-1 text-xs">homepage_sections</code> when
            the layout uses collection-driven shelves. This is separate from the main section
            stack above.
          </p>
        </div>
        <HomepageSectionsEditor initialRows={rails} collections={collections} />
      </section>
    </div>
  );
}
