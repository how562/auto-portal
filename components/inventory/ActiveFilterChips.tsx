"use client";

import type { FilterChip } from "@/lib/inventoryDiscovery";
import type { InventoryFilters } from "@/lib/inventorySearch";

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onRemove: (patch: Partial<InventoryFilters>) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  chips,
  onRemove,
  onClearAll,
}: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Your path
      </span>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onRemove(chip.patch)}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] py-2 pl-4 pr-3 text-xs font-medium text-white transition hover:bg-[var(--charcoal)]"
        >
          {chip.label}
          <span className="text-white/60" aria-hidden>
            ×
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
      >
        Clear path
      </button>
    </div>
  );
}
