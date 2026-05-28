import { StoriesEditor } from "@/components/admin/StoriesEditor";
import { listStoriesAdmin } from "@/lib/storiesAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function StoriesScreen() {
  const configured = isSupabaseAdminConfigured();
  let rows: Awaited<ReturnType<typeof listStoriesAdmin>> = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      rows = await listStoriesAdmin();
    } catch (error: unknown) {
      loadError =
        error instanceof Error ? error.message : "Failed to load stories";
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Stories</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Editorial posts for{" "}
          <a href="/stories" className="font-medium text-[var(--ink)] underline">
            /stories
          </a>
          . Published entries replace built-in placeholders on the live site.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to manage stories.
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      <StoriesEditor initialRows={rows} />
    </div>
  );
}
