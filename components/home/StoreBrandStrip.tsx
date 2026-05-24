import Link from "next/link";
import type { Store } from "@/lib/types";

interface StoreBrandStripProps {
  stores: Store[];
}

function storeInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function StoreBrandStrip({ stores }: StoreBrandStripProps) {
  if (stores.length === 0) return null;

  return (
    <section
      id="locations"
      className="scroll-mt-20 border-y border-[var(--line)] bg-white py-14 sm:py-16"
    >
      <div className="portal-container">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--muted)]">
          Our dealership network
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {stores.map((store) => (
            <Link
              key={store.id}
              href="/locations"
              className="flex min-w-[140px] flex-col items-center rounded-md border border-[var(--line-dark)] bg-[var(--cream)] px-6 py-5 transition-colors duration-200 hover:border-[var(--ink)]/35 sm:px-7 sm:py-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-[var(--ink)] text-sm font-bold text-white">
                {storeInitials(store.name)}
              </span>
              <p className="mt-4 text-center text-sm font-semibold text-[var(--ink)]">
                {store.name}
              </p>
              {(store.city || store.state) && (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {[store.city, store.state].filter(Boolean).join(", ")}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
