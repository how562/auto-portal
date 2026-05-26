import { getSupabaseAdmin } from "./supabaseAdmin";

const NOTE_SELECT =
  "id, title, body, pinned, archived, created_at, updated_at";

export interface NoteAdminRow {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteCreateInput {
  title?: string;
  body?: string;
  pinned?: boolean;
}

export interface NoteUpdateInput {
  title?: string;
  body?: string;
  pinned?: boolean;
  archived?: boolean;
}

function normalizeRow(row: Record<string, unknown>): NoteAdminRow | null {
  const id = typeof row.id === "string" ? row.id : "";
  if (!id) return null;

  return {
    id,
    title:
      typeof row.title === "string" && row.title.trim()
        ? row.title.trim()
        : "Untitled",
    body: typeof row.body === "string" ? row.body : "",
    pinned: row.pinned === true,
    archived: row.archived === true,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function listNotesAdmin(options?: {
  includeArchived?: boolean;
}): Promise<NoteAdminRow[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("notes")
    .select(NOTE_SELECT)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (!options?.includeArchived) {
    query = query.eq("archived", false);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(formatNotesDbError("load", error.message));
  }

  return (data ?? [])
    .map((row) => normalizeRow(row as Record<string, unknown>))
    .filter((row): row is NoteAdminRow => row != null);
}

export async function createNote(input: NoteCreateInput = {}): Promise<NoteAdminRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("notes")
    .insert({
      title: input.title?.trim() || "Untitled",
      body: input.body ?? "",
      pinned: input.pinned === true,
      updated_at: new Date().toISOString(),
    })
    .select(NOTE_SELECT)
    .single();

  if (error) {
    throw new Error(formatNotesDbError("create", error.message));
  }

  const row = normalizeRow(data as Record<string, unknown>);
  if (!row) throw new Error("Created note could not be read");
  return row;
}

export async function updateNote(
  id: string,
  input: NoteUpdateInput,
): Promise<NoteAdminRow> {
  const noteId = id.trim();
  if (!noteId) throw new Error("id is required");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    payload.title = input.title.trim() || "Untitled";
  }
  if (input.body !== undefined) payload.body = input.body;
  if (input.pinned !== undefined) payload.pinned = input.pinned;
  if (input.archived !== undefined) payload.archived = input.archived;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("notes")
    .update(payload)
    .eq("id", noteId)
    .select(NOTE_SELECT)
    .single();

  if (error) {
    throw new Error(formatNotesDbError("update", error.message));
  }

  const row = normalizeRow(data as Record<string, unknown>);
  if (!row) throw new Error("Updated note could not be read");
  return row;
}

export async function archiveNote(id: string): Promise<NoteAdminRow> {
  return updateNote(id, { archived: true, pinned: false });
}

function formatNotesDbError(action: string, message: string): string {
  if (/relation.*notes.*does not exist/i.test(message)) {
    return `Failed to ${action} note: the notes table is missing. Run the Supabase migration supabase/migrations/20260524160000_cms_collections_homepage_notes.sql.`;
  }
  if (/column notes\.archived does not exist/i.test(message)) {
    return `Failed to ${action} note: run migration supabase/migrations/20260525180000_notes_archived_column.sql (adds notes.archived).`;
  }
  if (/null value in column "user_id"/i.test(message)) {
    return `Failed to ${action} note: notes.user_id must be nullable for shared admin notes — run migration 20260525180000_notes_archived_column.sql.`;
  }
  return `Failed to ${action} note: ${message}`;
}
