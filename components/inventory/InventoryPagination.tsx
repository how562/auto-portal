"use client";

import Link from "next/link";
import { btnCardSecondary } from "@/lib/buttonClasses";

interface InventoryPaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function InventoryPagination({
  page,
  totalPages,
  buildHref,
}: InventoryPaginationProps) {
  if (totalPages <= 1) return null;

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--line)] pt-8"
      aria-label="Inventory pagination"
    >
      {page > 1 ? (
        <Link href={buildHref(prevPage)} className={btnCardSecondary}>
          Previous
        </Link>
      ) : (
        <span className={`${btnCardSecondary} pointer-events-none opacity-40`}>
          Previous
        </span>
      )}

      <p className="px-2 text-sm text-[var(--muted)]">
        Page {page} of {totalPages}
      </p>

      {page < totalPages ? (
        <Link href={buildHref(nextPage)} className={btnCardSecondary}>
          Next
        </Link>
      ) : (
        <span className={`${btnCardSecondary} pointer-events-none opacity-40`}>
          Next
        </span>
      )}
    </nav>
  );
}
