import { SocialFeedAdminScreen } from "@/components/admin/SocialFeedAdminScreen";
import { fetchSocialFeedAdminPayload } from "@/lib/socialFeedAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function AdminSocialFeedPage() {
  if (!isSupabaseAdminConfigured()) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to manage community posts.
      </p>
    );
  }

  const initial = await fetchSocialFeedAdminPayload();

  return <SocialFeedAdminScreen initial={initial} />;
}
