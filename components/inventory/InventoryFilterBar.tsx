"use client";

import { useState } from "react";
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
      className={`shrink-0 rounded-md px-4 py-2 text-sm font-medium transition duration-200 ${
        active
          ? "bg-[var(--ink)] text-white"
          : "bg-white text-[var(--muted)] ring-1 ring-[var(--line-dark)] hover:text-[var(--ink)]"
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
    <div>
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
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-[var(--line)] bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left sm:px-6"
      >
        <span className="text-sm font-semibold text-[var(--ink)]">
          Adjust your path
        </span>
        <span className="text-xs text-[var(--muted)]">{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div className="space-y-6 border-t border-[var(--line)] px-5 py-5 sm:px-6">
          <FilterGroup label="Condition">
            {(
              [
                ["all", "All"],
                ["new", "New"],
                ["used", "Pre-owned"],
                ["cpo", "Certified"],
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
            {(
              [
                ["all", "Any"],
                ["under-25k", "Under $25k"],
                ["under-30k", "Under $30k"],
                ["30-50k", "$30k–$50k"],
                ["50k-plus", "$50k+"],
              ] as const
            ).map(([value, label]) => (
              <FilterChip
                key={value}
                active={filters.budget === value}
                label={label}
                onClick={() => onChange({ budget: value })}
              />
            ))}
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

          <FilterGroup label="How you drive">
            {(
              [
                ["all", "All paths"],
                ["family", "Family"],
                ["work", "Work"],
                ["luxury", "Luxury"],
                ["budget", "Value"],
                ["first-vehicle", "First vehicle"],
                ["fuel-efficient", "Efficiency"],
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
              <FilterChip
                active={filters.storeId === "all"}
                label="All stores"
                onClick={() => onChange({ storeId: "all" })}
              />
              {stores.map((store) => (
                <FilterChip
                  key={store.id}
                  active={filters.storeId === store.id}
                  label={store.name}
                  onClick={() => onChange({ storeId: store.id })}
                />
              ))}
            </FilterGroup>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
