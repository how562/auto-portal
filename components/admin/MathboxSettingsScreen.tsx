import { MathboxSettingsEditor } from "@/components/admin/MathboxSettingsEditor";
import { getDefaultPricingMathboxConfig } from "@/lib/buildPricingMathbox";
import { listMathboxConfigRows } from "@/lib/mathboxAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function MathboxSettingsScreen() {
  const configured = isSupabaseAdminConfigured();
  let rows = getDefaultPricingMathboxConfig().map((row, index) => ({
    ...row,
    id: `default-${index}`,
  }));

  if (configured) {
    try {
      rows = await listMathboxConfigRows();
    } catch {
      /* fall back to code defaults */
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Math Box Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Control VDP price breakdown labels, order, visibility, and grouping.
          Vehicle prices come from the inventory feed only — this screen changes
          presentation, not pricing values.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to save math box settings.
          Until then, defaults from code apply on the VDP.
        </p>
      ) : null}

      <MathboxSettingsEditor initialRows={rows} />
    </div>
  );
}
