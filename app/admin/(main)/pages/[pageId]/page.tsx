import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { fetchPageSectionsForAdmin, fetchSitePageById } from "@/lib/cmsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

interface PageProps {
  params: { pageId: string };
}

export default async function AdminPageSectionsPage({ params }: PageProps) {
  if (!isSupabaseAdminConfigured()) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to edit sections.
      </p>
    );
  }

  const page = await fetchSitePageById(params.pageId);
  if (!page) notFound();

  const sections = await fetchPageSectionsForAdmin(params.pageId);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/pages"
          className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← All pages
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {page.title || page.slug}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          /{page.slug} · {page.status}
        </p>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No sections on this page. Add rows in <code>page_sections</code> in
          Supabase.
        </p>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <SectionEditor key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
