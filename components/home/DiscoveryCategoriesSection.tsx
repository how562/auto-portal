"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { LifestyleChoice } from "@/components/portal/DiscoveryContext";
import { countByCategory } from "@/lib/categoryCounts";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import type { Vehicle } from "@/lib/types";

const CATEGORIES: {
  id: LifestyleChoice;
  label: string;
  desc: string;
  accent: string;
}[] = [
  {
    id: "family",
    label: "Family",
    desc: "Space, safety, and daily comfort for everyone on board.",
    accent: "from-stone-200 to-stone-400",
  },
  {
    id: "work",
    label: "Work",
    desc: "Trucks and capability built for the job—and the weekend.",
    accent: "from-zinc-200 to-zinc-500",
  },
  {
    id: "luxury",
    label: "Luxury",
    desc: "Premium design, elevated trims, and refined performance.",
    accent: "from-amber-100 to-amber-300",
  },
  {
    id: "budget",
    label: "Budget",
    desc: "Transparent value under $30k across the group.",
    accent: "from-slate-200 to-slate-400",
  },
  {
    id: "first-vehicle",
    label: "First Vehicle",
    desc: "Approachable paths with human guidance at every step.",
    accent: "from-sky-100 to-sky-300",
  },
  {
    id: "fuel-efficient",
    label: "Fuel Efficient",
    desc: "Lower cost of ownership without compromising fit.",
    accent: "from-emerald-100 to-emerald-300",
  },
];

interface DiscoveryCategoriesSectionProps {
  vehicles: Vehicle[];
}

export function DiscoveryCategoriesSection({
  vehicles,
}: DiscoveryCategoriesSectionProps) {
  const router = useRouter();

  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((c) => [c.id, countByCategory(vehicles, c.id)]),
      ) as Record<LifestyleChoice, number>,
    [vehicles],
  );

  return (
    <section id="categories" className="scroll-mt-20 py-16 sm:py-24">
      <div className="portal-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              Shop by life
            </p>
            <h2 className="mt-4 headline-stack text-4xl sm:text-5xl">
              How do you drive?
            </h2>
            <p className="mt-4 text-[var(--muted)]">
              Editorial categories—not generic filters. Pick a path and we&apos;ll
              tune your matches instantly.
            </p>
            <div className="mt-8 hidden lg:block">
              <DiscoveryCTA layout="stack" size="compact" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {CATEGORIES.map((cat, index) => {
              const count = counts[cat.id];
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    router.push(`/inventory?lifestyle=${cat.id}`)
                  }
                  className={`group relative overflow-hidden rounded-[1.75rem] p-6 text-left transition duration-500 hover-lift sm:p-7 card-framer bg-white hover:ring-2 hover:ring-[var(--gold)]/50 ${
                    index === 0 ? "sm:col-span-2 sm:min-h-[200px]" : ""
                  }`}
                >
                  <div
                    className={`absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br ${cat.accent} opacity-60 transition duration-500 group-hover:scale-110`}
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
                        {cat.label}
                      </h3>
                      <span className="shrink-0 rounded-full bg-[var(--cream)] px-3 py-1 text-xs font-bold text-[var(--muted)] group-hover:bg-[var(--gold)] group-hover:text-[var(--ink)]">
                        {count > 0 ? `${count} vehicles` : "Explore"}
                      </span>
                    </div>
                    <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
                      {cat.desc}
                    </p>
                    <span className="mt-6 inline-flex text-sm font-semibold text-[var(--ink)]">
                      View matches →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 flex justify-center lg:hidden">
          <DiscoveryCTA />
        </div>
      </div>
    </section>
  );
}
