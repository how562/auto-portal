"use client";

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
      className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition duration-200 ${
        active
          ? "bg-[var(--ink)] text-white shadow-sm"
          : "bg-white text-[var(--muted)] ring-1 ring-[var(--line-dark)] hover:text-[var(--ink)]"
      }`}
    >
      {label}
    </button>
  );
}

const CONDITIONS: { value: InventoryCondition; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "used", label: "Pre-owned" },
  { value: "cpo", label: "Certified" },
];

const BODIES: { value: InventoryBodyStyle; label: string }[] = [
  { value: "all", label: "All styles" },
  { value: "suv", label: "SUV" },
  { value: "truck", label: "Truck" },
  { value: "sedan", label: "Sedan" },
  { value: "coupe", label: "Coupe" },
  { value: "van", label: "Van" },
];

export function InventoryQuickFilters({
  filters,
  onChange,
  onOpenMore,
  moreFilterCount,
}: InventoryQuickFiltersProps) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--line)] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Quick path
        </p>
        <button
          type="button"
          onClick={onOpenMore}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--line-dark)] bg-[var(--cream)] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
        >
          More filters
          {moreFilterCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--ink)] px-1.5 text-[10px] font-bold text-white">
              {moreFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Condition
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {CONDITIONS.map(({ value, label }) => (
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
          Body style
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {BODIES.map(({ value, label }) => (
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
