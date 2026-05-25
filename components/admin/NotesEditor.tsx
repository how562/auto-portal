"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NoteAdminRow } from "@/lib/notesAdmin";

interface NotesEditorProps {
  initialNotes: NoteAdminRow[];
}

export function NotesEditor({ initialNotes }: NotesEditorProps) {
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
    const res = await fetch(
      `/api/admin/notes?archived=${showArchived ? "1" : "0"}`,
      { credentials: "include" },
    );
    const data = (await res.json()) as { rows?: NoteAdminRow[] };
    if (data.rows) setNotes(data.rows);
  }, [showArchived]);

  useEffect(() => {
    void refreshNotes();
  }, [showArchived, refreshNotes]);

  async function createNote() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/notes", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = (await res.json()) as { row?: NoteAdminRow; error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    if (data.row) {
      setNotes((prev) => [data.row!, ...prev]);
      setSelectedId(data.row.id);
    }
  }

  async function saveNote() {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/notes", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedId,
        updates: { title: draftTitle, body: draftBody },
      }),
    });
    const data = (await res.json()) as { row?: NoteAdminRow; error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }
    if (data.row) {
      setNotes((prev) =>
        prev.map((n) => (n.id === data.row!.id ? data.row! : n)),
      );
    }
  }

  async function togglePin() {
    if (!selected) return;
    setSaving(true);
    const res = await fetch("/api/admin/notes", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selected.id,
        updates: { pinned: !selected.pinned },
      }),
    });
    const data = (await res.json()) as { row?: NoteAdminRow; error?: string };
    setSaving(false);
    if (data.row) {
      setNotes((prev) =>
        prev
          .map((n) => (n.id === data.row!.id ? data.row! : n))
          .sort((a, b) => Number(b.pinned) - Number(a.pinned)),
      );
    }
  }

  async function archiveNote() {
    if (!selectedId || !confirm("Archive this note?")) return;
    setSaving(true);
    const res = await fetch(
      `/api/admin/notes?id=${encodeURIComponent(selectedId)}`,
      { method: "DELETE", credentials: "include" },
    );
    const data = (await res.json()) as { row?: NoteAdminRow; error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Archive failed");
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== selectedId));
    setSelectedId(null);
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
          disabled={saving}
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
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
                  disabled={saving}
                  className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => void togglePin()}
                  disabled={saving}
                  className="rounded-md border border-[var(--line-dark)] px-4 py-2 text-sm"
                >
                  {selected.pinned ? "Unpin" : "Pin"}
                </button>
                {!selected.archived ? (
                  <button
                    type="button"
                    onClick={() => void archiveNote()}
                    disabled={saving}
                    className="rounded-md border border-[var(--line-dark)] px-4 py-2 text-sm text-[var(--muted)]"
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
