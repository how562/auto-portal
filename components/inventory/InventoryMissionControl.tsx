"use client";

import { useId, useMemo } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { InventorySortPills } from "@/components/inventory/InventorySortPills";
import type { InventoryViewMode } from "@/lib/inventoryView";
import type {
  InventoryBodyStyle,
  InventoryBudget,
  InventoryCondition,
  InventoryFilters,
  InventorySort,
} from "@/lib/inventorySearch";
import type { Vehicle } from "@/lib/types";

interface InventoryMissionControlProps {
  filters: InventoryFilters;
  vehicles: Vehicle[];
  makeFilter: string;
  modelFilter: string;
  moreFilterCount: number;
  viewMode: InventoryViewMode;
  onChange: (patch: Partial<InventoryFilters>) => void;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
  onOpenMore: () => void;
  onReset: () => void;
  onSortChange: (sort: InventoryFilters["sort"]) => void;
  onViewModeChange: (mode: InventoryViewMode) => void;
}

function ControlChip({
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
      className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-white text-[var(--ink)] shadow-sm"
          : "bg-white/10 text-white/80 ring-1 ring-white/15 hover:bg-white/15 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function DarkSelect({
  id,
  label,
  value,
  onChange,
  options,
  className = "",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <label
        htmlFor={id}
        className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-md border border-white/15 bg-white/10 py-1.5 pl-2.5 pr-7 text-xs font-medium text-white outline-none transition hover:border-white/25 focus:border-white/40 focus:ring-1 focus:ring-white/20"
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-[var(--navy-deep)] text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/50"
        >
          ▾
        </span>
      </div>
    </div>
  );
}

function ViewToggle({
  mode,
  active,
  onClick,
  label,
}: {
  mode: InventoryViewMode;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-white text-[var(--ink)]"
          : "text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden>{mode === "grid" ? "▦" : "☰"}</span>
      <span className="ml-1 hidden sm:inline">{label}</span>
    </button>
  );
}

export function InventoryMissionControl({
  filters,
  vehicles,
  makeFilter,
  modelFilter,
  moreFilterCount,
  viewMode,
  onChange,
  onMakeChange,
  onModelChange,
  onOpenMore,
  onReset,
  onSortChange,
  onViewModeChange,
}: InventoryMissionControlProps) {
  const { t } = useLanguage();
  const baseId = useId();

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

  const budgets: { value: InventoryBudget; label: string }[] = [
    { value: "all", label: t("inventory.filter.budgetAny") },
    { value: "under-25k", label: "Under $25k" },
    { value: "under-30k", label: "Under $30k" },
    { value: "under-40k", label: "Under $40k" },
    { value: "30-50k", label: "$30k–$50k" },
    { value: "50k-plus", label: "$50k+" },
  ];

  const makes = useMemo(() => {
    const set = new Set<string>();
    for (const vehicle of vehicles) {
      const make = vehicle.make?.trim();
      if (make) set.add(make);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [vehicles]);

  const models = useMemo(() => {
    const set = new Set<string>();
    for (const vehicle of vehicles) {
      if (makeFilter !== "all" && vehicle.make !== makeFilter) continue;
      const model = vehicle.model?.trim();
      if (model) set.add(model);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [vehicles, makeFilter]);

  const visibleSort: InventorySort =
    filters.sort === "merchandised" ||
    filters.sort === "value" ||
    filters.sort === "newest"
      ? filters.sort
      : "merchandised";

  return (
    <section
      aria-label={t("inventory.command.panelLabel")}
      className="overflow-hidden rounded-xl border border-[var(--ink)]/20 bg-[var(--navy-deep)] shadow-[0_8px_32px_rgba(12,22,40,0.18)]"
    >
      <div className="border-b border-white/10 px-3 py-2 sm:px-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
          {t("inventory.command.panelEyebrow")}
        </p>
      </div>

      {/* Mobile: horizontal chip rails */}
      <div className="space-y-2 border-b border-white/10 px-3 py-3 sm:hidden">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
          {t("inventory.condition")}
        </p>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 scrollbar-none">
          {conditions.map(({ value, label }) => (
            <ControlChip
              key={value}
              active={filters.condition === value}
              label={label}
              onClick={() => onChange({ condition: value })}
            />
          ))}
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
          {t("inventory.bodyStyle")}
        </p>
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 scrollbar-none">
          {bodies.map(({ value, label }) => (
            <ControlChip
              key={value}
              active={filters.bodyStyle === value}
              label={label}
              onClick={() => onChange({ bodyStyle: value })}
            />
          ))}
        </div>
      </div>

      {/* Desktop + shared selects */}
      <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-6 xl:grid-cols-8">
        <DarkSelect
          id={`${baseId}-condition`}
          label={t("inventory.condition")}
          value={filters.condition}
          onChange={(value) =>
            onChange({ condition: value as InventoryCondition })
          }
          options={conditions}
          className="hidden sm:block"
        />
        <DarkSelect
          id={`${baseId}-body`}
          label={t("inventory.bodyStyle")}
          value={filters.bodyStyle}
          onChange={(value) =>
            onChange({ bodyStyle: value as InventoryBodyStyle })
          }
          options={bodies}
          className="hidden sm:block"
        />
        <DarkSelect
          id={`${baseId}-make`}
          label={t("inventory.command.make")}
          value={makeFilter}
          onChange={onMakeChange}
          options={[
            { value: "all", label: t("inventory.filter.all") },
            ...makes.map((make) => ({ value: make, label: make })),
          ]}
        />
        <DarkSelect
          id={`${baseId}-model`}
          label={t("inventory.command.model")}
          value={modelFilter}
          onChange={onModelChange}
          options={[
            { value: "all", label: t("inventory.filter.all") },
            ...models.map((model) => ({ value: model, label: model })),
          ]}
        />
        <DarkSelect
          id={`${baseId}-budget`}
          label={t("inventory.command.budget")}
          value={filters.budget}
          onChange={(value) => onChange({ budget: value as InventoryBudget })}
          options={budgets}
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-[var(--ink)]/35 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenMore}
            className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            {t("inventory.moreFilters")}
            {moreFilterCount > 0 ? (
              <span className="flex h-4 min-w-4 items-center justify-center rounded bg-white px-1 text-[10px] font-bold text-[var(--ink)]">
                {moreFilterCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {t("inventory.command.reset")}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex rounded-md bg-white/10 p-0.5 ring-1 ring-white/15"
            role="group"
            aria-label={t("inventory.view.grid")}
          >
            <ViewToggle
              mode="grid"
              active={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
              label={t("inventory.view.grid")}
            />
            <ViewToggle
              mode="list"
              active={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
              label={t("inventory.view.list")}
            />
          </div>

          <div className="[&_label]:text-white/45 [&_select]:border-white/15 [&_select]:bg-white/10 [&_select]:text-white [&_select]:hover:border-white/25">
            <InventorySortPills
              value={visibleSort}
              onChange={onSortChange}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
