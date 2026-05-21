"use client";

import type { InventoryFilters } from "@/lib/inventorySearch";
import type { Store } from "@/lib/types";

interface InventoryFilterBarProps {
  filters: InventoryFilters;
  stores: Store[];
  onChange: (patch: Partial<InventoryFilters>) => void;
}

function FilterChip({
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
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition duration-200 ${
        active
          ? "bg-[var(--ink)] text-white shadow-sm"
          : "bg-white text-[var(--muted)] ring-1 ring-[var(--line-dark)] hover:text-[var(--ink)] hover:ring-[var(--ink)]/20"
      }`}
    >
      {label}
    </button>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="shrink-0">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function InventoryFilterBar({
  filters,
  stores,
  onChange,
}: InventoryFilterBarProps) {
  return (
    <div className="card-framer overflow-hidden p-4 sm:p-5">
      <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-thin">
        <FilterGroup label="Condition">
          {(
            [
              ["all", "All"],
              ["new", "New"],
              ["used", "Used"],
              ["cpo", "CPO"],
            ] as const
          ).map(([value, label]) => (
            <FilterChip
              key={value}
              active={filters.condition === value}
              label={label}
              onClick={() => onChange({ condition: value })}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="Budget">
          <select
            value={filters.budget}
            onChange={(e) =>
              onChange({
                budget: e.target.value as InventoryFilters["budget"],
              })
            }
            className="rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] ring-1 ring-[var(--line-dark)] focus:ring-2 focus:ring-[var(--ink)]/15"
          >
            <option value="all">Any budget</option>
            <option value="under-25k">Under $25k</option>
            <option value="under-30k">Under $30k</option>
            <option value="30-50k">$30k – $50k</option>
            <option value="50k-plus">$50k+</option>
          </select>
        </FilterGroup>

        <FilterGroup label="Body style">
          {(
            [
              ["all", "All"],
              ["suv", "SUV"],
              ["truck", "Truck"],
              ["sedan", "Sedan"],
              ["coupe", "Coupe"],
              ["van", "Van"],
            ] as const
          ).map(([value, label]) => (
            <FilterChip
              key={value}
              active={filters.bodyStyle === value}
              label={label}
              onClick={() => onChange({ bodyStyle: value })}
            />
          ))}
        </FilterGroup>

        <FilterGroup label="Lifestyle">
          {(
            [
              ["all", "All paths"],
              ["family", "Family"],
              ["work", "Work"],
              ["luxury", "Luxury"],
              ["budget", "Budget"],
              ["first-vehicle", "First vehicle"],
              ["fuel-efficient", "Efficient"],
            ] as const
          ).map(([value, label]) => (
            <FilterChip
              key={value}
              active={filters.lifestyle === value}
              label={label}
              onClick={() => onChange({ lifestyle: value })}
            />
          ))}
        </FilterGroup>

        {stores.length > 0 ? (
          <FilterGroup label="Store">
            <select
              value={filters.storeId}
              onChange={(e) => onChange({ storeId: e.target.value })}
              className="max-w-[200px] rounded-full border-0 bg-white px-4 py-2 text-sm font-medium text-[var(--ink)] ring-1 ring-[var(--line-dark)] focus:ring-2 focus:ring-[var(--ink)]/15"
            >
              <option value="all">All stores</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </FilterGroup>
        ) : null}
      </div>
    </div>
  );
}
