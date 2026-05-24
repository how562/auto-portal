"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { btnSecondarySm } from "@/lib/buttonClasses";

import type { InventoryFilters, RefinementSuggestion } from "@/lib/inventorySearch";

interface GuidedRefinementProps {
  suggestions: RefinementSuggestion[];
  onApply: (patch: Partial<InventoryFilters>) => void;
}

export function GuidedRefinement({
  suggestions,
  onApply,
}: GuidedRefinementProps) {
  const { t } = useLanguage();

  if (suggestions.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold text-[var(--ink)]">
        {t("inventory.refineMatch")}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onApply(s.patch)}
            className={`${btnSecondarySm} border-[var(--line)] text-xs hover:border-[var(--gold)]`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
