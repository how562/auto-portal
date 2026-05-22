"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { InventorySort } from "@/lib/inventorySearch";

interface InventorySortPillsProps {
  value: InventorySort;
  onChange: (sort: InventorySort) => void;
}

export function InventorySortPills({ value, onChange }: InventorySortPillsProps) {
  const { t } = useLanguage();

  const options: { value: InventorySort; label: string }[] = [
    { value: "match", label: t("inventory.sort.bestMatch") },
    { value: "value", label: t("inventory.sort.bestValue") },
    { value: "newest", label: t("inventory.sort.newestArrivals") },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
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
