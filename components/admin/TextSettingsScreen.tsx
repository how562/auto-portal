import { TextSettingsEditor } from "@/components/admin/TextSettingsEditor";
import { listPortalTextSettings } from "@/lib/textSettingsAdmin";
import { PORTAL_TEXT_KEYS } from "@/lib/portalTextFallbacks";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function TextSettingsScreen() {
  const configured = isSupabaseAdminConfigured();
  let rows: Awaited<ReturnType<typeof listPortalTextSettings>> = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      rows = await listPortalTextSettings();
    } catch (error: unknown) {
      loadError =
        error instanceof Error ? error.message : "Failed to load text settings";
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

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      <TextSettingsEditor
        initialRows={rows}
        tableEmpty={configured && !loadError && rows.length === 0}
        expectedKeyCount={PORTAL_TEXT_KEYS.length}
      />
    </div>
  );
}
