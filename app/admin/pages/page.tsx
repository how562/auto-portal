import { SitePagesManager } from "@/components/admin/SitePagesManager";
import { listAllSitePagesForAdmin } from "@/lib/cmsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const configured = isSupabaseAdminConfigured();
  const pages = configured ? await listAllSitePagesForAdmin() : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Site pages</h1>
        <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
          Pages are grouped as <strong className="font-semibold text-[var(--ink)]">Live</strong>,{" "}
          <strong className="font-semibold text-[var(--ink)]">Drafts</strong>, and a separate{" "}
          <strong className="font-semibold text-[var(--ink)]">CMS workbench</strong> for section
          previews. Every row in{" "}
          <code className="rounded bg-[var(--cream)] px-1 text-xs">site_pages</code> is listed —
          use search to find a page across all groups.
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
