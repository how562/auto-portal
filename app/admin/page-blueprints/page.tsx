import { PageBlueprintsScreen } from "@/components/admin/PageBlueprintsScreen";
import { isScreenshotBlueprintAiEnabled } from "@/lib/cmsFeatureFlags";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default function AdminPageBlueprintsPage() {
  const supabaseConfigured = isSupabaseAdminConfigured();

  return (
    <div className="space-y-8">
      {!supabaseConfigured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to create draft pages from blueprints.
        </p>
      ) : null}
      <PageBlueprintsScreen
        screenshotAiEnabled={isScreenshotBlueprintAiEnabled()}
      />
    </div>
  );
}
