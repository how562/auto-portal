import Link from "next/link";
import { ADMIN_SORT_OPTIONS } from "@/lib/inventoryDiscovery";
import type { AdminInventorySort } from "@/lib/adminInventory";

interface AdminInventorySortControlsProps {
  current: AdminInventorySort;
  buildHref: (sort: AdminInventorySort) => string;
}

const HELP_TEXT: Record<AdminInventorySort, string> = {
  merchandised:
    "Default backend order. Vehicles with photos and complete data appear first across the customer-facing site.",
  photos: "Highest image counts first — useful for picking spotlight inventory.",
  "needs-attention":
    "Surfaces vehicles missing photos or details so the merchandising team can fix them.",
  "newest-added": "Sorts by import time — latest feeds at the top.",
};

/**
 * Admin-only segmented control for merchandising sort.
 *
 * These labels ("Best Merchandised", "Most Photos", "Needs Attention",
 * "Newest Added") are intentionally never rendered to customers — they
 * describe how the back office prioritizes inventory.
 */
export function AdminInventorySortControls({
  current,
  buildHref,
}: AdminInventorySortControlsProps) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-5">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Merchandising sort (admin only)
        </p>
        <p className="text-sm text-[var(--muted)]">
          Controls how inventory is ranked behind the scenes. Customers never
          see these labels.
        </p>
      </div>

      <div
        role="group"
        aria-label="Merchandising sort"
        className="mt-4 flex flex-wrap gap-2"
      >
        {ADMIN_SORT_OPTIONS.map((option) => {
          const active = option.value === current;
          return (
            <Link
              key={option.value}
              href={buildHref(option.value)}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[var(--ink)] text-white shadow-sm"
                  : "bg-[var(--cream)] text-[var(--ink)] ring-1 ring-[var(--line-dark)] hover:ring-[var(--ink)]"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">{HELP_TEXT[current]}</p>
    </div>
  );
}
