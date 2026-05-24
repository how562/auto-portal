"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeSmartMatchLifestyleKey } from "@/lib/smartMatchLifestyle";
import type { SmartMatchRuleAdminRow } from "@/lib/smartMatchRulesAdmin";

interface SmartMatchRulesEditorProps {
  initialRows: SmartMatchRuleAdminRow[];
}

function toCsv(values: string[]): string {
  return values.join(", ");
}

function fromCsv(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatPriceRange(row: SmartMatchRuleAdminRow): string {
  const min = row.min_price != null ? `$${row.min_price}` : "—";
  const max = row.max_price != null ? `$${row.max_price}` : "—";
  return `${min} – ${max}`;
}

export function SmartMatchRulesEditor({ initialRows }: SmartMatchRulesEditorProps) {
  const [rows, setRows] = useState(initialRows);
  const [editing, setEditing] = useState<SmartMatchRuleAdminRow | null>(null);
  const [draft, setDraft] = useState({
    label_en: "",
    label_es: "",
    body_styles: "",
    makes: "",
    model_keywords: "",
    trim_keywords: "",
    min_price: "",
    max_price: "",
    condition: "any",
    priority: "0",
    is_active: true,
  });
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) return;
    setDraft({
      label_en: editing.label_en ?? "",
      label_es: editing.label_es ?? "",
      body_styles: toCsv(editing.body_styles),
      makes: toCsv(editing.makes),
      model_keywords: toCsv(editing.model_keywords),
      trim_keywords: toCsv(editing.trim_keywords),
      min_price: editing.min_price?.toString() ?? "",
      max_price: editing.max_price?.toString() ?? "",
      condition: editing.condition ?? "any",
      priority: String(editing.priority ?? 0),
      is_active: editing.is_active,
    });
  }, [editing]);

  const updateRow = useCallback((updated: SmartMatchRuleAdminRow) => {
    setRows((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
  }, []);

  async function patchRule(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<SmartMatchRuleAdminRow | null> {
    const res = await fetch("/api/admin/smart-match-rules", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, updates }),
    });
    const data = (await res.json()) as {
      row?: SmartMatchRuleAdminRow;
      error?: string;
    };
    if (!res.ok) {
      throw new Error(data.error ?? "Save failed");
    }
    return data.row ?? null;
  }

  async function toggleActive(row: SmartMatchRuleAdminRow, is_active: boolean) {
    setSavingId(row.id);
    setError(null);
    try {
      const updated = await patchRule(row.id, { is_active });
      if (updated) updateRow(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Toggle failed");
    } finally {
      setSavingId(null);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setSavingId(editing.id);
    setError(null);
    try {
      const updated = await patchRule(editing.id, {
        label_en: draft.label_en || null,
        label_es: draft.label_es || null,
        body_styles: fromCsv(draft.body_styles),
        makes: fromCsv(draft.makes),
        model_keywords: fromCsv(draft.model_keywords),
        trim_keywords: fromCsv(draft.trim_keywords),
        min_price: draft.min_price ? Number(draft.min_price) : null,
        max_price: draft.max_price ? Number(draft.max_price) : null,
        condition: draft.condition,
        priority: Number.parseInt(draft.priority, 10) || 0,
        is_active: draft.is_active,
      });
      if (updated) updateRow(updated);
      setEditing(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          No smart match rules in the database yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
          <table className="w-full min-w-[960px] text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--cream)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3">Lifestyle</th>
                <th className="px-4 py-3">Label (EN)</th>
                <th className="px-4 py-3">Body styles</th>
                <th className="px-4 py-3">Makes</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {rows.map((row) => {
                const lifestyleLabel =
                  normalizeSmartMatchLifestyleKey(row.lifestyle) ?? row.lifestyle;
                return (
                  <tr key={row.id} className="hover:bg-[var(--cream)]/60">
                    <td className="px-4 py-3 font-mono text-xs">{lifestyleLabel}</td>
                    <td className="px-4 py-3">{row.label_en ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {toCsv(row.body_styles) || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted)]">
                      {toCsv(row.makes) || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">{formatPriceRange(row)}</td>
                    <td className="px-4 py-3 text-xs">{row.condition ?? "any"}</td>
                    <td className="px-4 py-3">{row.priority}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={row.is_active}
                        disabled={savingId === row.id}
                        onChange={(e) => void toggleActive(row, e.target.checked)}
                        className="rounded border-[var(--line-dark)]"
                        aria-label={`Toggle rule ${lifestyleLabel}`}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        className="rounded-md border border-[var(--line-dark)] px-3 py-1 text-xs font-semibold hover:bg-[var(--cream-dark)]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => setEditing(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--line)] bg-white p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Edit smart match rule</h3>
            <p className="mt-1 font-mono text-xs text-[var(--muted)]">
              {editing.lifestyle}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-medium text-[var(--muted)] sm:col-span-2">
                Label (EN)
                <input
                  value={draft.label_en}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, label_en: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)] sm:col-span-2">
                Label (ES)
                <input
                  value={draft.label_es}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, label_es: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)] sm:col-span-2">
                Body styles (comma-separated)
                <input
                  value={draft.body_styles}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, body_styles: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)] sm:col-span-2">
                Makes (comma-separated)
                <input
                  value={draft.makes}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, makes: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)] sm:col-span-2">
                Model keywords (comma-separated)
                <input
                  value={draft.model_keywords}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      model_keywords: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)] sm:col-span-2">
                Trim keywords (comma-separated)
                <input
                  value={draft.trim_keywords}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      trim_keywords: e.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Min price
                <input
                  type="number"
                  value={draft.min_price}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, min_price: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Max price
                <input
                  type="number"
                  value={draft.max_price}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, max_price: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Condition
                <select
                  value={draft.condition}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, condition: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                >
                  <option value="any">any</option>
                  <option value="new">new</option>
                  <option value="used">used</option>
                  <option value="cpo">cpo</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Priority
                <input
                  type="number"
                  value={draft.priority}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, priority: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--ink)] sm:col-span-2">
                <input
                  type="checkbox"
                  checked={draft.is_active}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, is_active: e.target.checked }))
                  }
                  className="rounded border-[var(--line-dark)]"
                />
                Active
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md px-4 py-2 text-sm font-medium text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void saveEdit()}
                disabled={savingId === editing.id}
                className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {savingId === editing.id ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
