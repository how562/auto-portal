"use client";

import { btnSecondaryMd } from "@/lib/buttonClasses";

export interface FaqItem {
  question?: string;
  answer?: string;
}

interface FaqItemsEditorProps {
  items: FaqItem[];
  onChange: (items: FaqItem[]) => void;
}

export function FaqItemsEditor({ items, onChange }: FaqItemsEditorProps) {
  function update(index: number, patch: Partial<FaqItem>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Questions &amp; answers
      </p>
      {items.map((item, index) => (
        <div
          key={index}
          className="space-y-2 rounded-xl border border-[var(--line)] bg-[var(--cream)]/40 p-3"
        >
          <label className="block space-y-1">
            <span className="text-xs text-[var(--muted)]">Question</span>
            <input
              value={item.question ?? ""}
              onChange={(e) => update(index, { question: e.target.value })}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-[var(--muted)]">Answer</span>
            <textarea
              rows={2}
              value={item.answer ?? ""}
              onChange={(e) => update(index, { answer: e.target.value })}
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
      <button
        type="button"
        className={btnSecondaryMd}
        onClick={() => onChange([...items, { question: "", answer: "" }])}
      >
        Add question
      </button>
    </div>
  );
}
