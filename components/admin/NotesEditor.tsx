"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NoteAdminRow } from "@/lib/notesAdmin";

interface NotesEditorProps {
  initialNotes: NoteAdminRow[];
  configured: boolean;
}

async function parseNotesResponse(res: Response): Promise<{
  rows?: NoteAdminRow[];
  row?: NoteAdminRow;
  error?: string;
}> {
  try {
    return (await res.json()) as {
      rows?: NoteAdminRow[];
      row?: NoteAdminRow;
      error?: string;
    };
  } catch {
    return { error: res.status === 404 ? "Notes API not found" : "Invalid server response" };
  }
}

export function NotesEditor({ initialNotes, configured }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialNotes[0]?.id ?? null,
  );
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notes.filter((n) => {
      if (!showArchived && n.archived) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    });
  }, [notes, search, showArchived]);

  const selected = notes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) {
      setDraftTitle(selected.title);
      setDraftBody(selected.body);
    } else {
      setDraftTitle("");
      setDraftBody("");
    }
  }, [selectedId, selected?.updated_at, selected]);

  const refreshNotes = useCallback(async () => {
    if (!configured) return;
    const res = await fetch(
      `/api/admin/notes?archived=${showArchived ? "1" : "0"}`,
      { credentials: "include" },
    );
    const data = await parseNotesResponse(res);
    if (!res.ok) {
      setError(data.error ?? "Failed to refresh notes");
      return;
    }
    if (data.rows) {
      setNotes(data.rows);
      setSelectedId((current) => {
        if (current && data.rows!.some((n) => n.id === current)) return current;
        return data.rows![0]?.id ?? null;
      });
    }
  }, [showArchived, configured]);

  useEffect(() => {
    void refreshNotes();
  }, [showArchived, refreshNotes]);

  async function createNote() {
    if (!configured) {
      setError("Supabase admin is not configured.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled", body: "" }),
      });
      const data = await parseNotesResponse(res);
      if (!res.ok) {
        setError(data.error ?? "Create failed");
        return;
      }
      if (data.row) {
        setNotes((prev) => [data.row!, ...prev]);
        setSelectedId(data.row.id);
        setDraftTitle(data.row.title);
        setDraftBody(data.row.body);
      }
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!selectedId) return;
    if (!configured) {
      setError("Supabase admin is not configured.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          updates: { title: draftTitle, body: draftBody },
        }),
      });
      const data = await parseNotesResponse(res);
      if (!res.ok) {
        setError(data.error ?? "Save failed");
        return;
      }
      if (data.row) {
        setNotes((prev) =>
          prev.map((n) => (n.id === data.row!.id ? data.row! : n)),
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function togglePin() {
    if (!selected || !configured) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selected.id,
          updates: { pinned: !selected.pinned },
        }),
      });
      const data = await parseNotesResponse(res);
      if (!res.ok) {
        setError(data.error ?? "Pin failed");
        return;
      }
      if (data.row) {
        setNotes((prev) =>
          prev
            .map((n) => (n.id === data.row!.id ? data.row! : n))
            .sort((a, b) => Number(b.pinned) - Number(a.pinned)),
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function archiveNote() {
    if (!selectedId || !confirm("Archive this note?")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/notes?id=${encodeURIComponent(selectedId)}`,
        { method: "DELETE", credentials: "include" },
      );
      const data = await parseNotesResponse(res);
      if (!res.ok) {
        setError(data.error ?? "Archive failed");
        return;
      }
      setNotes((prev) => prev.filter((n) => n.id !== selectedId));
      setSelectedId(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Show archived
        </label>
        <button
          type="button"
          onClick={() => void createNote()}
          disabled={saving || !configured}
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          New note
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid min-h-[420px] gap-4 lg:grid-cols-[240px_1fr]">
        <ul className="space-y-1 overflow-auto rounded-2xl border border-[var(--line)] bg-white p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-[var(--muted)]">
              No notes
            </li>
          ) : (
            filtered.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(note.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedId === note.id
                      ? "bg-[var(--cream-dark)] font-medium"
                      : "hover:bg-[var(--cream)]"
                  }`}
                >
                  {note.pinned ? (
                    <span className="mr-1 text-[var(--gold)]">★</span>
                  ) : null}
                  {note.title}
                  {note.archived ? (
                    <span className="ml-1 text-[10px] text-[var(--muted)]">
                      (archived)
                    </span>
                  ) : null}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
          {selected ? (
            <div className="space-y-4">
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="w-full text-lg font-semibold outline-none"
              />
              <textarea
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                rows={14}
                className="w-full resize-y rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm leading-relaxed"
                placeholder="Internal notes…"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void saveNote()}
                  disabled={saving || !configured}
                  className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => void togglePin()}
                  disabled={saving || !configured}
                  className="rounded-md border border-[var(--line-dark)] px-4 py-2 text-sm disabled:opacity-50"
                >
                  {selected.pinned ? "Unpin" : "Pin"}
                </button>
                {!selected.archived ? (
                  <button
                    type="button"
                    onClick={() => void archiveNote()}
                    disabled={saving || !configured}
                    className="rounded-md border border-[var(--line-dark)] px-4 py-2 text-sm text-[var(--muted)] disabled:opacity-50"
                  >
                    Archive
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              Select a note or create a new one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
