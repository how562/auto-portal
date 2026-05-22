"use client";

import { InventorySortPills } from "@/components/inventory/InventorySortPills";
import type { InventoryViewMode } from "@/lib/inventoryView";
import type { InventoryFilters } from "@/lib/inventorySearch";

interface InventoryResultsToolbarProps {
  count: number;
  sort: InventoryFilters["sort"];
  viewMode: InventoryViewMode;
  onSortChange: (sort: InventoryFilters["sort"]) => void;
  onViewModeChange: (mode: InventoryViewMode) => void;
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
      className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${
        active
          ? "bg-[var(--ink)] text-white"
          : "text-[var(--muted)] hover:text-[var(--ink)]"
      }`}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden>{mode === "grid" ? "▦" : "☰"}</span>
      <span className="ml-1.5 hidden sm:inline">{label}</span>
    </button>
  );
}

export function InventoryResultsToolbar({
  count,
  sort,
  viewMode,
  onSortChange,
  onViewModeChange,
}: InventoryResultsToolbarProps) {
  return (
    <div className="sticky top-[4.5rem] z-30 -mx-4 border-b border-[var(--line)] bg-[var(--cream)]/95 px-4 py-4 backdrop-blur-md sm:top-24 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-lg font-semibold tracking-tight text-[var(--ink)]">
            {count}{" "}
            <span className="font-normal text-[var(--muted)]">
              {count === 1 ? "match" : "matches"}
            </span>
          </p>
          <p className="text-xs text-[var(--muted)]">Updated as you refine</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <div
            className="inline-flex rounded-full bg-white p-1 ring-1 ring-[var(--line-dark)]"
            role="group"
            aria-label="View mode"
          >
            <ViewToggle
              mode="grid"
              active={viewMode === "grid"}
              onClick={() => onViewModeChange("grid")}
              label="Grid view"
            />
            <ViewToggle
              mode="list"
              active={viewMode === "list"}
              onClick={() => onViewModeChange("list")}
              label="List view"
            />
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              Order by
            </p>
            <InventorySortPills value={sort} onChange={onSortChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
