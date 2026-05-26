"use client";

import { btnSecondaryMd } from "@/lib/buttonClasses";

export interface StatItem {
  value?: string;
  label?: string;
}

interface StatsItemsEditorProps {
  items: StatItem[];
  onChange: (items: StatItem[]) => void;
}

export function StatsItemsEditor({ items, onChange }: StatsItemsEditorProps) {
  function update(index: number, patch: Partial<StatItem>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Statistics
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-[var(--line)] bg-[var(--cream)]/40 p-3"
          >
            <label className="block space-y-1">
              <span className="text-xs text-[var(--muted)]">Value</span>
              <input
                value={item.value ?? ""}
                onChange={(e) => update(index, { value: e.target.value })}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-[var(--muted)]">Label</span>
              <input
                value={item.label ?? ""}
                onChange={(e) => update(index, { label: e.target.value })}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
            <button
              type="button"
              className={`${btnSecondaryMd} text-xs text-red-700`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className={btnSecondaryMd}
        onClick={() => onChange([...items, { value: "", label: "" }])}
      >
        Add stat
      </button>
    </div>
  );
}
