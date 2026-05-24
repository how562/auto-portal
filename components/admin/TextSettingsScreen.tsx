import { TextSettingsEditor } from "@/components/admin/TextSettingsEditor";
import { listPortalTextSettings } from "@/lib/textSettingsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function TextSettingsScreen() {
  const configured = isSupabaseAdminConfigured();
  let rows: Awaited<ReturnType<typeof listPortalTextSettings>> = [];

  if (configured) {
    try {
      rows = await listPortalTextSettings();
    } catch {
      /* empty list */
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Text Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Edit portal copy strings used on the homepage, inventory, and Smart Match
          flows. Changes apply to English and Spanish labels stored in{" "}
          <code className="rounded bg-[var(--cream)] px-1.5 py-0.5 text-xs">
            portal_text_settings
          </code>
          .
        </p>
      </div>
      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to load and save text settings.
        </p>
      ) : null}

      <TextSettingsEditor initialRows={rows} />
    </div>
  );
}
