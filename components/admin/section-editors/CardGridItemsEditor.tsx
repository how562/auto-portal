"use client";

import { CmsImageField } from "@/components/admin/CmsImageField";
import { btnSecondaryMd } from "@/lib/buttonClasses";

export interface CardGridItem {
  title?: string;
  body?: string;
  image_url?: string;
  link_label?: string;
  link_href?: string;
}

interface CardGridItemsEditorProps {
  cards: CardGridItem[];
  onChange: (cards: CardGridItem[]) => void;
}

export function CardGridItemsEditor({ cards, onChange }: CardGridItemsEditorProps) {
  function update(index: number, patch: Partial<CardGridItem>) {
    const next = cards.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChange(next);
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Cards
      </p>
      {cards.map((card, index) => (
        <div
          key={index}
          className="space-y-3 rounded-xl border border-[var(--line)] bg-[var(--cream)]/40 p-4"
        >
          <p className="text-xs font-semibold text-[var(--ink)]">Card {index + 1}</p>
          <CmsImageField
            label="Image"
            value={card.image_url ?? ""}
            onChange={(url) => update(index, { image_url: url })}
          />
          <label className="block space-y-1">
            <span className="text-xs text-[var(--muted)]">Title</span>
            <input
              value={card.title ?? ""}
              onChange={(e) => update(index, { title: e.target.value })}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-[var(--muted)]">Body</span>
            <textarea
              rows={2}
              value={card.body ?? ""}
              onChange={(e) => update(index, { body: e.target.value })}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs text-[var(--muted)]">Link label</span>
              <input
                value={card.link_label ?? ""}
                onChange={(e) => update(index, { link_label: e.target.value })}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-[var(--muted)]">Link URL</span>
              <input
                value={card.link_href ?? ""}
                onChange={(e) => update(index, { link_href: e.target.value })}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
          </div>
          <button
            type="button"
            className={`${btnSecondaryMd} text-xs text-red-700`}
            onClick={() => onChange(cards.filter((_, i) => i !== index))}
          >
            Remove card
          </button>
        </div>
      ))}
      <button
        type="button"
        className={btnSecondaryMd}
        onClick={() =>
          onChange([
            ...cards,
            {
              title: "",
              body: "",
              link_label: "Learn more",
              link_href: "/",
            },
          ])
        }
      >
        Add card
      </button>
    </div>
  );
}
