"use client";

import type { InventoryFilters, RefinementSuggestion } from "@/lib/inventorySearch";

interface GuidedRefinementProps {
  suggestions: RefinementSuggestion[];
  onApply: (patch: Partial<InventoryFilters>) => void;
}

export function GuidedRefinement({
  suggestions,
  onApply,
}: GuidedRefinementProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-[1.75rem] border border-[var(--line-dark)] bg-[var(--cream)]/80 px-5 py-4 sm:px-6">
      <p className="text-sm font-semibold text-[var(--ink)]">Refine your match</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Quick suggestions to narrow what fits your life—not endless filters.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onApply(s.patch)}
            className="rounded-full border border-dashed border-[var(--gold)] bg-white px-4 py-2 text-sm text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-white hover:shadow-sm"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
