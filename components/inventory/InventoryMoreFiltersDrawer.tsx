"use client";

import { useEffect, useRef } from "react";
import type { InventoryFilters } from "@/lib/inventorySearch";
import type { Store } from "@/lib/types";

interface InventoryMoreFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: InventoryFilters;
  stores: Store[];
  onChange: (patch: Partial<InventoryFilters>) => void;
}

function DrawerChip({
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
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[var(--ink)] text-white"
          : "bg-[var(--cream)] text-[var(--muted)] ring-1 ring-[var(--line-dark)] hover:text-[var(--ink)]"
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

export function InventoryMoreFiltersDrawer({
  open,
  onClose,
  filters,
  stores,
  onChange,
}: InventoryMoreFiltersDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/40 backdrop-blur-[2px]"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-filters-title"
        className="relative flex h-full w-full max-w-md flex-col bg-white shadow-[-12px_0_48px_rgba(12,12,12,0.12)]"
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4 sm:px-6">
          <h2
            id="more-filters-title"
            className="text-lg font-semibold tracking-tight text-[var(--ink)]"
          >
            More filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--cream)] hover:text-[var(--ink)]"
          >
            Done
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-6 sm:px-6">
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
              <DrawerChip
                key={value}
                active={filters.budget === value}
                label={label}
                onClick={() => onChange({ budget: value })}
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
              <DrawerChip
                key={value}
                active={filters.lifestyle === value}
                label={label}
                onClick={() => onChange({ lifestyle: value })}
              />
            ))}
          </FilterGroup>

          {stores.length > 0 ? (
            <FilterGroup label="Store">
              <DrawerChip
                active={filters.storeId === "all"}
                label="All stores"
                onClick={() => onChange({ storeId: "all" })}
              />
              {stores.map((store) => (
                <DrawerChip
                  key={store.id}
                  active={filters.storeId === store.id}
                  label={store.name}
                  onClick={() => onChange({ storeId: store.id })}
                />
              ))}
            </FilterGroup>
          ) : null}
        </div>
      </div>
    </div>
  );
}
