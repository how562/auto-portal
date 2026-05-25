import { NotesEditor } from "@/components/admin/NotesEditor";
import { listNotesAdmin } from "@/lib/notesAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export async function NotesScreen() {
  const configured = isSupabaseAdminConfigured();
  let notes: Awaited<ReturnType<typeof listNotesAdmin>> = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      notes = await listNotesAdmin();
    } catch (error: unknown) {
      loadError = error instanceof Error ? error.message : "Failed to load notes";
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Internal admin scratchpad. Not shown on the public site.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to use notes.
        </p>
      ) : null}

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : null}

      <NotesEditor initialNotes={notes} configured={configured} />
    </div>
  );
}
