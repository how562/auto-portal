import { SitePagesManager } from "@/components/admin/SitePagesManager";
import { listAllSitePages } from "@/lib/cmsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const configured = isSupabaseAdminConfigured();
  const pages = configured ? await listAllSitePages() : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Site pages</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Create marketing pages, manage SEO, add bilingual sections, and preview
          before publishing.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to load and save CMS data
          from the admin UI.
        </p>
      ) : (
        <SitePagesManager initialPages={pages} />
      )}
    </div>
  );
}
