"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildInventoryKeywordSearchUrl,
  HOMEPAGE_INVENTORY_SEARCH_CHIPS,
  homepageInventorySearchChipHref,
} from "@/lib/homepageInventorySearchBridge";
import { btnPrimarySm } from "@/lib/buttonClasses";

const SEARCH_PLACEHOLDER =
  "Search all inventory by make, model, body style, or keyword";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" strokeLinecap="round" />
    </svg>
  );
}

export function HomepageInventorySearchBridge({
  variant = "standalone",
  hideHelperLine = false,
  hideEyebrow = false,
}: {
  variant?: "standalone" | "hero" | "video-hero";
  /** Removes the smaller helper line under the eyebrow. */
  hideHelperLine?: boolean;
  /** Removes the eyebrow label above the search input. */
  hideEyebrow?: boolean;
}) {
  const router = useRouter();
  const inputId = useId();
  const [query, setQuery] = useState("");

  function submitSearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      router.push("/inventory");
      return;
    }
    router.push(buildInventoryKeywordSearchUrl(trimmed));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitSearch(query);
  }

  const isHeroVariant = variant === "hero" || variant === "video-hero";

  const chipsSource = isHeroVariant
    ? HOMEPAGE_INVENTORY_SEARCH_CHIPS.slice(0, 5)
    : HOMEPAGE_INVENTORY_SEARCH_CHIPS;

  const chipButtonClass =
    isHeroVariant
      ? "homepage-search-pill inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-[var(--line-dark)] bg-white px-4 text-sm font-semibold text-[var(--muted)] transition hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--ink)_18%,var(--line-dark))] hover:bg-white hover:text-[var(--ink)] hover:shadow-[0_4px_14px_rgba(9,33,63,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
      : "rounded-full border border-[var(--line)] bg-white/60 px-3 py-1 text-[11px] font-semibold text-[var(--muted)] transition hover:border-[var(--line-dark)] hover:bg-white hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

  const chips = (
    <ul
      className={
        isHeroVariant
          ? "flex w-full flex-nowrap items-center gap-2 whitespace-nowrap lg:justify-end"
          : "flex flex-wrap items-center justify-center gap-1.5 sm:gap-2"
      }
      aria-label="Quick inventory searches"
    >
      {chipsSource.map((chip) => (
        <li key={chip.id} className={isHeroVariant ? "shrink-0" : ""}>
          <button
            type="button"
            onClick={() => router.push(homepageInventorySearchChipHref(chip))}
            className={chipButtonClass}
          >
            {chip.label}
          </button>
        </li>
      ))}
    </ul>
  );

  const form = (
    <form
      className={
        isHeroVariant
          ? "homepage-search-form w-full"
          : hideEyebrow && hideHelperLine
            ? "mt-0"
            : hideEyebrow || hideHelperLine
              ? "mt-2"
              : "mt-4"
      }
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search all inventory"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0 sm:rounded-full sm:border sm:border-[var(--line-dark)] sm:bg-white sm:p-1 sm:shadow-[var(--shadow-tight)]">
        <div className="relative min-w-0 flex-1 sm:flex sm:items-center">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)] sm:left-4" />
          <label htmlFor={inputId} className="sr-only">
            Search all inventory
          </label>
          <input
            id={inputId}
            name="search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            autoComplete="off"
            className="w-full rounded-full border border-[var(--line-dark)] bg-white py-2.5 pl-10 pr-4 text-sm text-[var(--ink)] shadow-[var(--shadow-tight)] placeholder:text-[var(--muted)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] sm:border-0 sm:bg-transparent sm:py-2.5 sm:pl-11 sm:shadow-none"
          />
        </div>
        <button
          type="submit"
          className={`${btnPrimarySm} shrink-0 sm:rounded-full sm:px-6`}
        >
          Search
        </button>
      </div>
    </form>
  );

  return (
    <section aria-labelledby={`${inputId}-eyebrow`}>
      {variant === "video-hero" ? (
        <div className="homepage-search-bridge--video-hero w-full">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6 xl:gap-8">
            <div className="w-full lg:basis-[54%] xl:basis-[60%]">{form}</div>
            <div className="min-w-0 flex-1 overflow-x-auto">{chips}</div>
          </div>
        </div>
      ) : variant === "hero" ? (
        <div className="homepage-search-bridge--hero w-full">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6 xl:gap-8">
            <div className="w-full lg:basis-[54%] xl:basis-[60%]">{form}</div>
            <div className="min-w-0 flex-1">{chips}</div>
          </div>
        </div>
      ) : (
        <div className="border-t border-[var(--line)]/80 bg-[var(--cream)] py-6 sm:py-8">
          <div className="portal-container mx-auto max-w-3xl">
            <div className="text-center">
              {!hideEyebrow ? (
                <p
                  id={`${inputId}-eyebrow`}
                  className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]"
                >
                  Know what you&apos;re looking for?
                </p>
              ) : null}
              {!hideHelperLine ? (
                <p className="mt-2 text-sm leading-snug text-[var(--muted)]">
                  Search the traditional way, or explore by lifestyle below.
                </p>
              ) : null}
            </div>
            {form}
            <div className="mt-2">{chips}</div>
          </div>
        </div>
      )}
    </section>
  );
}
