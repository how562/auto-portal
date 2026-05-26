"use client";

import { btnSecondaryMd } from "@/lib/buttonClasses";

export interface CtaButtonItem {
  label?: string;
  url?: string;
}

interface CtaButtonsEditorProps {
  buttons: CtaButtonItem[];
  onChange: (buttons: CtaButtonItem[]) => void;
}

export function CtaButtonsEditor({ buttons, onChange }: CtaButtonsEditorProps) {
  function update(index: number, patch: Partial<CtaButtonItem>) {
    const next = buttons.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Buttons
      </p>
      {buttons.map((btn, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-xl border border-[var(--line)] bg-[var(--cream)]/40 p-3 sm:grid-cols-2"
        >
          <label className="block space-y-1">
            <span className="text-xs text-[var(--muted)]">Label</span>
            <input
              value={btn.label ?? ""}
              onChange={(e) => update(index, { label: e.target.value })}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-[var(--muted)]">URL</span>
            <input
              value={btn.url ?? ""}
              onChange={(e) => update(index, { url: e.target.value })}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            className={`${btnSecondaryMd} text-xs text-red-700 sm:col-span-2`}
            onClick={() => onChange(buttons.filter((_, i) => i !== index))}
          >
            Remove button
          </button>
        </div>
      ))}
      <button
        type="button"
        className={btnSecondaryMd}
        onClick={() => onChange([...buttons, { label: "", url: "/" }])}
      >
        Add button
      </button>
    </div>
  );
}
