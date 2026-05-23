"use client";

import type { InventoryFilters, LifeRefinementChip } from "@/lib/inventorySearch";

interface LifeRefinementChipsProps {
  chips: LifeRefinementChip[];
  onApply: (patch: Partial<InventoryFilters>) => void;
}

export function LifeRefinementChips({ chips, onApply }: LifeRefinementChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Refine your life match"
    >
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onApply(chip.patch)}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
            chip.active
              ? "border-[var(--ink)] bg-[var(--ink)] text-white"
              : "border-[var(--line-dark)] bg-white text-[var(--muted)] hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}