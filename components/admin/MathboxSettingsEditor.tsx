"use client";

import { useCallback, useState } from "react";
import type { PricingMathboxConfigDbRow } from "@/lib/mathboxAdmin";
import type {
  MathboxAppliesTo,
  MathboxGroupName,
  MathboxLineType,
} from "@/lib/pricingMathboxTypes";

const GROUP_OPTIONS: MathboxGroupName[] = [
  "standard",
  "discounts",
  "conditional",
  "fees",
  "final",
];

const LINE_TYPE_OPTIONS: MathboxLineType[] = [
  "charge",
  "discount",
  "subtotal",
  "final",
  "info",
];

const APPLIES_TO_OPTIONS: MathboxAppliesTo[] = [
  "all",
  "new",
  "used",
  "certified",
];

interface MathboxSettingsEditorProps {
  initialRows: PricingMathboxConfigDbRow[];
}

type RowDraft = PricingMathboxConfigDbRow;

function boolField(
  id: string,
  label: string,
  checked: boolean,
  onChange: (value: boolean) => void,
) {
  return (
    <label className="flex items-center gap-2 text-xs text-[var(--ink)]">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-[var(--line-dark)]"
      />
      {label}
    </label>
  );
}

export function MathboxSettingsEditor({ initialRows }: MathboxSettingsEditorProps) {
  const [rows, setRows] = useState<RowDraft[]>(initialRows);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  const updateRow = useCallback((lineKey: string, patch: Partial<RowDraft>) => {
    setRows((prev) =>
      prev.map((row) =>
        row.line_key === lineKey ? { ...row, ...patch } : row,
      ),
    );
    setSavedKey(null);
  }, []);

  async function saveRow(lineKey: string) {
    const row = rows.find((r) => r.line_key === lineKey);
    if (!row) return;

    setSavingKey(lineKey);
    setError(null);

    const res = await fetch("/api/admin/mathbox-settings", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        line_key: lineKey,
        updates: {
          label: row.label,
          label_es: row.label_es,
          source_key: row.source_key,
          group_name: row.group_name,
          line_type: row.line_type,
          display_order: row.display_order,
          is_active: row.is_active,
          is_conditional: row.is_conditional,
          show_when_zero: row.show_when_zero,
          collapse_by_default: row.collapse_by_default,
          disclaimer_text: row.disclaimer_text,
          disclaimer_key: row.disclaimer_key,
          applies_to: row.applies_to,
        },
      }),
    });

    const data = (await res.json()) as { row?: RowDraft; error?: string };
    setSavingKey(null);

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }

    if (data.row) {
      setRows((prev) =>
        prev.map((r) => (r.line_key === lineKey ? data.row! : r)),
      );
    }
    setSavedKey(lineKey);
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="space-y-6">
        {rows.map((row) => (
          <article
            key={row.line_key}
            className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] pb-4">
              <div>
                <p className="font-mono text-xs text-[var(--muted)]">{row.line_key}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Feed key:{" "}
                  <code className="rounded bg-[var(--cream)] px-1.5 py-0.5 text-[var(--ink)]">
                    {row.source_key}
                  </code>
                </p>
              </div>
              <button
                type="button"
                onClick={() => void saveRow(row.line_key)}
                disabled={savingKey === row.line_key}
                className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {savingKey === row.line_key
                  ? "Saving…"
                  : savedKey === row.line_key
                    ? "Saved"
                    : "Save line"}
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block text-xs font-medium text-[var(--muted)]">
                Label (EN)
                <input
                  value={row.label}
                  onChange={(e) =>
                    updateRow(row.line_key, { label: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Label (ES)
                <input
                  value={row.label_es ?? ""}
                  onChange={(e) =>
                    updateRow(row.line_key, {
                      label_es: e.target.value || null,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Source key
                <input
                  value={row.source_key}
                  onChange={(e) =>
                    updateRow(row.line_key, { source_key: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Group
                <select
                  value={row.group_name}
                  onChange={(e) =>
                    updateRow(row.line_key, {
                      group_name: e.target.value as MathboxGroupName,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                >
                  {GROUP_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Line type
                <select
                  value={row.line_type}
                  onChange={(e) =>
                    updateRow(row.line_key, {
                      line_type: e.target.value as MathboxLineType,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                >
                  {LINE_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Display order
                <input
                  type="number"
                  value={row.display_order}
                  onChange={(e) =>
                    updateRow(row.line_key, {
                      display_order: Number.parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Applies to
                <select
                  value={row.applies_to}
                  onChange={(e) =>
                    updateRow(row.line_key, {
                      applies_to: e.target.value as MathboxAppliesTo,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                >
                  {APPLIES_TO_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-medium text-[var(--muted)] sm:col-span-2">
                Disclaimer text (optional override)
                <input
                  value={row.disclaimer_text ?? ""}
                  onChange={(e) =>
                    updateRow(row.line_key, {
                      disclaimer_text: e.target.value || null,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-xs font-medium text-[var(--muted)]">
                Disclaimer i18n key
                <input
                  value={row.disclaimer_key ?? ""}
                  onChange={(e) =>
                    updateRow(row.line_key, {
                      disclaimer_key: e.target.value || null,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 font-mono text-sm"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 border-t border-[var(--line)] pt-4">
              {boolField(
                `${row.line_key}-active`,
                "Visible (active)",
                row.is_active,
                (v) => updateRow(row.line_key, { is_active: v }),
              )}
              {boolField(
                `${row.line_key}-conditional`,
                "Conditional",
                row.is_conditional,
                (v) => updateRow(row.line_key, { is_conditional: v }),
              )}
              {boolField(
                `${row.line_key}-zero`,
                "Show when zero",
                row.show_when_zero,
                (v) => updateRow(row.line_key, { show_when_zero: v }),
              )}
              {boolField(
                `${row.line_key}-collapse`,
                "Collapse group by default",
                row.collapse_by_default,
                (v) => updateRow(row.line_key, { collapse_by_default: v }),
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
