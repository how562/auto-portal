"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import type {
  InventoryBodyStyle,
  InventoryCondition,
  InventoryFilters,
} from "@/lib/inventorySearch";

interface InventoryQuickFiltersProps {
  filters: InventoryFilters;
  onChange: (patch: Partial<InventoryFilters>) => void;
  onOpenMore: () => void;
  moreFilterCount: number;
}

function QuickChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-md px-3.5 py-2 text-sm font-medium transition duration-200 ${
        active
          ? "bg-[var(--ink)] text-white shadow-sm"
          : "bg-white text-[var(--muted)] ring-1 ring-[var(--line-dark)] hover:text-[var(--ink)]"
      }`}
    >
      {label}
    </button>
  );
}

export function InventoryQuickFilters({
  filters,
  onChange,
  onOpenMore,
  moreFilterCount,
}: InventoryQuickFiltersProps) {
  const { t } = useLanguage();

  const conditions: { value: InventoryCondition; label: string }[] = [
    { value: "all", label: t("inventory.filter.all") },
    { value: "new", label: t("inventory.filter.new") },
    { value: "used", label: t("inventory.filter.used") },
    { value: "cpo", label: t("inventory.filter.cpo") },
  ];

  const bodies: { value: InventoryBodyStyle; label: string }[] = [
    { value: "all", label: t("inventory.filter.allStyles") },
    { value: "suv", label: t("inventory.filter.suv") },
    { value: "truck", label: t("inventory.filter.truck") },
    { value: "sedan", label: t("inventory.filter.sedan") },
    { value: "coupe", label: t("inventory.filter.coupe") },
    { value: "van", label: t("inventory.filter.van") },
  ];

  return (
    <div className="rounded-lg border border-[var(--line)] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          {t("inventory.quickPath")}
        </p>
        <button
          type="button"
          onClick={onOpenMore}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--line-dark)] bg-[var(--cream)] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
        >
          {t("inventory.moreFilters")}
          {moreFilterCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-[var(--ink)] px-1.5 text-[10px] font-bold text-white">
              {moreFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {t("inventory.condition")}
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {conditions.map(({ value, label }) => (
            <QuickChip
              key={value}
              active={filters.condition === value}
              label={label}
              onClick={() => onChange({ condition: value })}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {t("inventory.bodyStyle")}
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {bodies.map(({ value, label }) => (
            <QuickChip
              key={value}
              active={filters.bodyStyle === value}
              label={label}
              onClick={() => onChange({ bodyStyle: value })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
