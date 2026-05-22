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
    <div>
      <p className="text-sm font-semibold text-[var(--ink)]">Refine your match</p>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Gentle suggestions—not more filters to wrestle with.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onApply(s.patch)}
            className="rounded-full border border-[var(--line-dark)] bg-white px-5 py-2.5 text-sm text-[var(--ink)] transition hover:border-[var(--gold)] hover:shadow-[0_8px_24px_rgba(12,12,12,0.06)]"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
