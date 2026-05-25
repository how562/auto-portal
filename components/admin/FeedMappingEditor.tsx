"use client";

import { useCallback, useMemo, useState } from "react";
import type { FeedFileMappingAdminRow } from "@/lib/feedFileMappingsAdmin";
import type { AdminStoreOption } from "@/lib/storesAdmin";

interface FeedMappingEditorProps {
  initialRows: FeedFileMappingAdminRow[];
  stores: AdminStoreOption[];
}

const emptyDraft = {
  file_pattern: "",
  store_id: "",
  notes: "",
  is_active: true,
};

export function FeedMappingEditor({
  initialRows,
  stores,
}: FeedMappingEditorProps) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (!showInactive && !row.is_active) return false;
      if (!q) return true;
      return (
        row.file_pattern.toLowerCase().includes(q) ||
        (row.store_name ?? "").toLowerCase().includes(q) ||
        (row.notes ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, showInactive]);

  const openCreate = useCallback(() => {
    setCreating(true);
    setEditingId(null);
    setDraft(emptyDraft);
    setError(null);
  }, []);

  const openEdit = useCallback((row: FeedFileMappingAdminRow) => {
    setCreating(false);
    setEditingId(row.id);
    setDraft({
      file_pattern: row.file_pattern,
      store_id: row.store_id,
      notes: row.notes ?? "",
      is_active: row.is_active,
    });
    setError(null);
  }, []);

  const closeForm = useCallback(() => {
    setCreating(false);
    setEditingId(null);
    setDraft(emptyDraft);
  }, []);

  async function saveForm() {
    setSaving(true);
    setError(null);

    const payload = creating
      ? {
          method: "POST" as const,
          body: {
            file_pattern: draft.file_pattern,
            store_id: draft.store_id,
            notes: draft.notes || null,
            is_active: draft.is_active,
          },
        }
      : {
          method: "PATCH" as const,
          body: {
            id: editingId,
            updates: {
              file_pattern: draft.file_pattern,
              store_id: draft.store_id,
              notes: draft.notes || null,
              is_active: draft.is_active,
            },
          },
        };

    const res = await fetch("/api/admin/feed-file-mappings", {
      method: payload.method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.body),
    });

    const data = (await res.json()) as {
      row?: FeedFileMappingAdminRow;
      error?: string;
    };
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }

    if (data.row) {
      setRows((prev) => {
        if (creating) return [...prev, data.row!].sort((a, b) =>
          a.file_pattern.localeCompare(b.file_pattern),
        );
        return prev.map((row) => (row.id === data.row!.id ? data.row! : row));
      });
    }
    closeForm();
  }

  async function deactivate(id: string) {
    if (!confirm("Deactivate this mapping? Imports will stop using it.")) return;
    setError(null);

    const res = await fetch(`/api/admin/feed-file-mappings?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = (await res.json()) as {
      row?: FeedFileMappingAdminRow;
      error?: string;
    };

    if (!res.ok) {
      setError(data.error ?? "Deactivate failed");
      return;
    }

    if (data.row) {
      setRows((prev) =>
        prev.map((row) => (row.id === data.row!.id ? data.row! : row)),
      );
    }
  }

  const formOpen = creating || editingId != null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pattern or store…"
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive
        </label>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
        >
          Add mapping
        </button>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Patterns match HomeNet filenames (e.g.{" "}
        <code className="rounded bg-[var(--cream)] px-1">CavenderBuickGMCNorth</code>
        ). DB mappings take priority over{" "}
        <code className="rounded bg-[var(--cream)] px-1">HOMENET_STORE_FILE_MAP</code>.
      </p>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          No mappings yet. Add a file pattern and store to route SFTP files.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          {filtered.map((row) => (
            <li
              key={row.id}
              className={`flex flex-wrap items-start justify-between gap-4 px-5 py-4 ${
                row.is_active ? "" : "bg-[var(--cream)]/50 opacity-80"
              }`}
            >
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-mono text-sm font-medium text-[var(--ink)]">
                  {row.file_pattern}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {row.store_name ?? row.store_id}
                </p>
                {row.notes ? (
                  <p className="text-xs text-[var(--muted)]">{row.notes}</p>
                ) : null}
                {!row.is_active ? (
                  <span className="inline-block rounded-full border border-[var(--line-dark)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    Inactive
                  </span>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(row)}
                  className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--cream-dark)]"
                >
                  Edit
                </button>
                {row.is_active ? (
                  <button
                    type="button"
                    onClick={() => void deactivate(row.id)}
                    className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--cream-dark)]"
                  >
                    Deactivate
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">
              {creating ? "Add file mapping" : "Edit file mapping"}
            </h3>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-medium text-[var(--muted)]">
                File pattern
                <input
                  value={draft.file_pattern}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, file_pattern: e.target.value }))
                  }
                  placeholder="CavenderBuickGMCNorth"
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Store
                <select
                  value={draft.store_id}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, store_id: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                >
                  <option value="">Select store…</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Notes
                <input
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, is_active: e.target.checked }))
                  }
                />
                Active
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md px-4 py-2 text-sm text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveForm()}
                disabled={
                  saving ||
                  !draft.file_pattern.trim() ||
                  !draft.store_id.trim()
                }
                className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
