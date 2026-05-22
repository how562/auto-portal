"use client";

import { SORT_OPTIONS } from "@/lib/inventoryDiscovery";
import type { InventorySort } from "@/lib/inventorySearch";

interface InventorySortPillsProps {
  value: InventorySort;
  onChange: (sort: InventorySort) => void;
}

export function InventorySortPills({ value, onChange }: InventorySortPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            value === opt.value
              ? "bg-[var(--ink)] text-white"
              : "bg-white text-[var(--muted)] ring-1 ring-[var(--line-dark)] hover:text-[var(--ink)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
