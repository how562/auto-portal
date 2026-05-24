import { MediaManager } from "@/components/admin/MediaManager";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export default function AdminMediaPage() {
  const configured = isSupabaseAdminConfigured();

  return (
    <>
      {!configured ? (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code> to
          enable uploads. Run the <code>cms-media</code> migration in Supabase if
          the bucket is missing.
        </p>
      ) : null}
      <MediaManager />
    </>
  );
}
