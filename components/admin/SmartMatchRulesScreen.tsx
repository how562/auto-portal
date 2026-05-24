import { SmartMatchRulesEditor } from "@/components/admin/SmartMatchRulesEditor";
import { listSmartMatchRulesAdmin } from "@/lib/smartMatchRulesAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function SmartMatchRulesScreen() {
  const configured = isSupabaseAdminConfigured();
  let rows: Awaited<ReturnType<typeof listSmartMatchRulesAdmin>> = [];

  if (configured) {
    try {
      rows = await listSmartMatchRulesAdmin();
    } catch {
      /* empty list */
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Smart Match Rules</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Tune lifestyle matching rules for Shop by Life and Smart Match. These rules
          filter inventory — they do not change vehicle data from feeds.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to load and save smart match rules.
        </p>
      ) : null}

      <SmartMatchRulesEditor initialRows={rows} />
    </div>
  );
}