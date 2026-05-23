"use client";

import { useId } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { CUSTOMER_SORT_OPTIONS } from "@/lib/inventoryDiscovery";
import type { InventorySort } from "@/lib/inventorySearch";

interface InventorySortPillsProps {
  value: InventorySort;
  onChange: (sort: InventorySort) => void;
}

const CUSTOMER_VALUES = new Set<InventorySort>(
  CUSTOMER_SORT_OPTIONS.map((option) => option.value),
);

/**
 * Customer-facing sort dropdown.
 *
 * Only the consumer-friendly options ("Featured", "Best Value",
 * "Newest") are exposed here. Back-office merchandising sorts
 * (Best Merchandised / Most Photos / Needs Attention / Newest Added)
 * live in the admin inventory tools and must NOT appear in the shopper
 * UI — see `ADMIN_SORT_OPTIONS` in `lib/inventoryDiscovery.ts`.
 *
 * Component name kept as `InventorySortPills` for backward compatibility
 * with existing call sites; rendered as a native `<select>`.
 */
export function InventorySortPills({ value, onChange }: InventorySortPillsProps) {
  const { t } = useLanguage();
  const labelId = useId();

  const visibleValue: InventorySort = CUSTOMER_VALUES.has(value)
    ? value
    : "merchandised";

  return (
    <div className="flex items-center gap-2">
      <label
        id={labelId}
        htmlFor={`${labelId}-select`}
        className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]"
      >
        {t("inventory.sort.label")}
      </label>
      <div className="relative">
        <select
          id={`${labelId}-select`}
          aria-labelledby={labelId}
          value={visibleValue}
          onChange={(event) => onChange(event.target.value as InventorySort)}
          className="appearance-none rounded-md bg-white py-2 pl-3 pr-8 text-sm font-medium text-[var(--ink)] ring-1 ring-[var(--line-dark)] transition hover:ring-[var(--ink)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--ink)]"
        >
          {CUSTOMER_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.i18nKey)}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]"
        >
          ▾
        </span>
      </div>
    </div>
  );
}
