import { PortalNavigationEditor } from "@/components/admin/PortalNavigationEditor";
import { listPortalManagedLinks } from "@/lib/managedLinksAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function PortalNavigationScreen() {
  const configured = isSupabaseAdminConfigured();
  let rows: Awaited<ReturnType<typeof listPortalManagedLinks>> = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      rows = await listPortalManagedLinks();
    } catch (error: unknown) {
      loadError =
        error instanceof Error ? error.message : "Failed to load navigation";
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Navigation</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
          Manage site-wide header links, footer columns, and portal button labels (CTAs).
          The public site reads active rows from{" "}
          <code className="rounded bg-[var(--cream)] px-1.5 py-0.5 text-xs">
            portal_managed_links
          </code>
          . Inactive items are hidden on the storefront.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to load and save navigation.
        </p>
      ) : null}

      {loadError ? (
        <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p>{loadError}</p>
          {loadError.includes("portal_managed_links") ? (
            <p className="text-red-900/80">
              In Supabase: open <strong>SQL Editor</strong>, paste the contents of{" "}
              <code className="rounded bg-white/60 px-1 py-0.5 text-xs">
                supabase/migrations/20260523160000_portal_managed_links.sql
              </code>
              , and run it. Then refresh this page.
            </p>
          ) : null}
        </div>
      ) : null}

      {configured && !loadError ? (
        <PortalNavigationEditor initialRows={rows} />
      ) : null}
    </div>
  );
}
