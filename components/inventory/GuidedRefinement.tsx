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
      <p className="text-sm font-semibold text-[var(--ink)]">
        {t("inventory.refineMatch")}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">{t("inventory.refineHint")}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onApply(s.patch)}
            className={`${btnSecondarySm} hover:border-[var(--gold)]`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
