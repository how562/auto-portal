"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { btnPrimarySm } from "@/lib/buttonClasses";
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
  const { t } = useLanguage();

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {t("inventory.chip.yourPath")}
      </span>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={() => onRemove(chip.patch)}
          className={`inline-flex items-center gap-2 ${btnPrimarySm} pl-4 pr-3`}
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
        {t("inventory.chip.clearPath")}
      </button>
    </div>
  );
}
