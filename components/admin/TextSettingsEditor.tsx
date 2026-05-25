"use client";

import { useCallback, useMemo, useState } from "react";
import type { PortalTextSettingRow } from "@/lib/textSettingsAdmin";

interface TextSettingsEditorProps {
  initialRows: PortalTextSettingRow[];
  /** True when the table returned zero rows (not a filter miss). */
  tableEmpty?: boolean;
  expectedKeyCount?: number;
}

function groupByCategory(rows: PortalTextSettingRow[]): Map<string, PortalTextSettingRow[]> {
  const map = new Map<string, PortalTextSettingRow[]>();
  for (const row of rows) {
    const key = (row.category ?? "uncategorized").toLowerCase();
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return new Map(Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)));
}

export function TextSettingsEditor({
  initialRows,
  tableEmpty = false,
  expectedKeyCount,
}: TextSettingsEditorProps) {
  const [rows, setRows] = useState(initialRows);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftEn, setDraftEn] = useState("");
  const [draftEs, setDraftEs] = useState("");
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) {
      set.add((row.category ?? "uncategorized").toLowerCase());
    }
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const cat = (row.category ?? "uncategorized").toLowerCase();
      if (categoryFilter !== "all" && cat !== categoryFilter) return false;
      if (!q) return true;
      return (
        row.text_key.toLowerCase().includes(q) ||
        row.label_en.toLowerCase().includes(q) ||
        (row.label_es ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, search, categoryFilter]);

  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);

  const openEdit = useCallback((row: PortalTextSettingRow) => {
    setEditingKey(row.text_key);
    setDraftEn(row.label_en);
    setDraftEs(row.label_es ?? "");
    setError(null);
  }, []);

  const closeEdit = useCallback(() => {
    setEditingKey(null);
    setDraftEn("");
    setDraftEs("");
  }, []);

  async function saveEdit(textKey: string) {
    setSavingKey(textKey);
    setError(null);

    const res = await fetch("/api/admin/text-settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text_key: textKey,
        updates: {
          label_en: draftEn,
          label_es: draftEs || null,
        },
      }),
    });

    const data = (await res.json()) as {
      row?: PortalTextSettingRow;
      error?: string;
    };
    setSavingKey(null);

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }

    if (data.row) {
      setRows((prev) =>
        prev.map((row) => (row.text_key === textKey ? data.row! : row)),
      );
    }
    closeEdit();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search keys or labels…"
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {tableEmpty ? (
        <div className="rounded-2xl border border-dashed border-[var(--line-dark)] bg-[var(--cream)]/40 px-6 py-12 text-center text-sm text-[var(--muted)]">
          <p className="font-medium text-[var(--ink)]">
            No rows in <code className="font-mono text-xs">portal_text_settings</code>
          </p>
          <p className="mx-auto mt-3 max-w-md leading-relaxed">
            Seed the table (e.g. migration{" "}
            <code className="font-mono text-xs">20260522210000_portal_text_settings</code>
            {expectedKeyCount
              ? ` — ${expectedKeyCount} Smart Match keys`
              : null}
            ) so copy can be edited here. Until then, the public site uses built-in
            fallbacks for wired keys.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          No text settings match your filters.
        </p>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([category, categoryRows]) => (
            <section key={category}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {category}
              </h2>
              <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
                {categoryRows.map((row: PortalTextSettingRow) => (
                  <li
                    key={row.text_key}
                    className="flex flex-wrap items-start justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-mono text-xs text-[var(--muted)]">
                        {row.text_key}
                      </p>
                      <p className="text-sm font-medium">{row.label_en}</p>
                      {row.label_es ? (
                        <p className="text-sm text-[var(--muted)]">{row.label_es}</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold transition hover:bg-[var(--cream-dark)]"
                    >
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {editingKey ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={closeEdit}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-[var(--line)] bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="text-settings-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="text-settings-edit-title"
              className="text-lg font-semibold tracking-tight"
            >
              Edit copy
            </h3>
            <p className="mt-1 font-mono text-xs text-[var(--muted)]">{editingKey}</p>
            <div className="mt-4 space-y-4">
              <label className="block text-xs font-medium text-[var(--muted)]">
                Label (EN)
                <input
                  value={draftEn}
                  onChange={(e) => setDraftEn(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Label (ES)
                <input
                  value={draftEs}
                  onChange={(e) => setDraftEs(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-md px-4 py-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEdit(editingKey)}
                disabled={savingKey === editingKey || !draftEn.trim()}
                className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingKey === editingKey ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
