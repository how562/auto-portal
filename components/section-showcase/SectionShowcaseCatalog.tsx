"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SectionShowcasePresetPreview } from "@/components/section-showcase/SectionShowcasePresetPreview";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";
import {
  filterCatalogEntries,
  getSectionShowcaseCatalogEntries,
  groupCatalogByCategory,
  SHOWCASE_CATEGORIES,
  type ShowcaseCategoryId,
} from "@/lib/sectionShowcaseCatalog";
import { SECTION_SHOWCASE_PRESET_COUNT } from "@/lib/sectionShowcasePresets";

export function SectionShowcaseCatalog() {
  const allEntries = useMemo(() => getSectionShowcaseCatalogEntries(), []);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ShowcaseCategoryId | "all">(
    "all",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterCatalogEntries(allEntries, { query, categoryId: categoryFilter }),
    [allEntries, query, categoryFilter],
  );

  const grouped = useMemo(() => groupCatalogByCategory(filtered), [filtered]);

  function jumpToCategory(categoryId: string) {
    setCategoryFilter("all");
    requestAnimationFrame(() => {
      document.getElementById(`catalog-${categoryId}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <DiscoveryProvider>
      <LeadCaptureProvider>
        <div className="-mx-2 min-w-0 space-y-8 sm:-mx-0">
          <header className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              Section catalog
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
              CMS layout library
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
              Browse {SECTION_SHOWCASE_PRESET_COUNT} premade presets by category. Compare
              metadata and live previews side by side.{" "}
              <Link
                href="/section-showcase"
                className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
              >
                Open full continuous preview
              </Link>
            </p>
            <Link
              href="/admin/pages"
              className="inline-flex text-sm font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
            >
              ← Back to pages
            </Link>
          </header>

          <div className="sticky top-0 z-20 -mx-2 border-b border-[var(--line)] bg-[var(--cream)]/95 px-2 py-4 backdrop-blur-sm sm:mx-0 sm:px-0">
            <div className="space-y-3">
              <label className="block">
                <span className="sr-only">Search presets</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, key, type, or use case…"
                  className="w-full rounded-lg border border-[var(--line-dark)] bg-white px-4 py-2.5 text-sm shadow-[var(--shadow-tight)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
                />
              </label>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Jump to category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SHOWCASE_CATEGORIES.map((cat) => {
                    const count = allEntries.filter((e) => e.categoryId === cat.id).length;
                    if (count === 0) return null;
                    return (
                      <CategoryPill
                        key={cat.id}
                        active={false}
                        onClick={() => jumpToCategory(cat.id)}
                        label={cat.title}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Quick filter
                </p>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {(
                    [
                      ["page-headers", "Page headers only"],
                      ["galleries", "Galleries only"],
                      ["forms-contact", "Forms only"],
                    ] as const
                  ).map(([id, label]) => (
                    <CategoryPill
                      key={id}
                      active={categoryFilter === id}
                      onClick={() =>
                        setCategoryFilter(categoryFilter === id ? "all" : id)
                      }
                      label={label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Show only
                </p>
                <div
                  className="flex flex-wrap gap-1.5"
                  role="tablist"
                  aria-label="Filter by category"
                >
                  <CategoryPill
                    active={categoryFilter === "all"}
                    onClick={() => setCategoryFilter("all")}
                    label={`All (${allEntries.length})`}
                  />
                  {SHOWCASE_CATEGORIES.map((cat) => {
                    const count = allEntries.filter((e) => e.categoryId === cat.id).length;
                    if (count === 0) return null;
                    return (
                      <CategoryPill
                        key={cat.id}
                        active={categoryFilter === cat.id}
                        onClick={() => setCategoryFilter(cat.id)}
                        label={`${cat.title} (${count})`}
                      />
                    );
                  })}
                </div>
              </div>

              {filtered.length !== allEntries.length ? (
                <p className="text-xs text-[var(--muted)]">
                  Showing {filtered.length} of {allEntries.length} presets
                </p>
              ) : null}
            </div>
          </div>

          {grouped.length === 0 ? (
            <p className="rounded-lg border border-[var(--line)] bg-white px-4 py-8 text-center text-sm text-[var(--muted)]">
              No presets match your search. Clear filters to see the full catalog.
            </p>
          ) : (
            <div className="space-y-14">
              {grouped.map(({ category, presets }) => (
                <section
                  key={category.id}
                  id={`catalog-${category.id}`}
                  className="scroll-mt-36"
                >
                  <div className="mb-6 border-b border-[var(--line)] pb-4">
                    <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
                      {category.title}
                    </h2>
                    <p className="mt-1 max-w-3xl text-sm text-[var(--muted)]">
                      {category.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-[var(--muted)]">
                      {presets.length} preset{presets.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <ul className="space-y-8">
                    {presets.map((entry) => {
                      const isExpanded = expandedId === entry.section.id;
                      return (
                        <li
                          key={entry.section.id}
                          id={entry.section.id}
                          className="scroll-mt-36 rounded-xl border border-[var(--line-dark)] bg-white shadow-[var(--shadow-tight)]"
                        >
                          <div
                            className={`grid gap-0 ${
                              isExpanded
                                ? "grid-cols-1"
                                : "lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]"
                            }`}
                          >
                            <div className="border-b border-[var(--line)] p-5 lg:border-b-0 lg:border-r">
                              <PresetMeta entry={entry} />
                              <div className="mt-5 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled
                                  title="Open a page in the builder to add sections"
                                  className={`${btnPrimaryMd} cursor-not-allowed opacity-50`}
                                >
                                  Add to page
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedId(isExpanded ? null : entry.section.id)
                                  }
                                  className={btnSecondaryMd}
                                >
                                  {isExpanded ? "Collapse preview" : "View full example"}
                                </button>
                                <Link
                                  href={`/section-showcase#${entry.section.id}`}
                                  className={`${btnSecondaryMd} no-underline`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Public preview
                                </Link>
                              </div>
                            </div>

                            <div className="p-4 sm:p-5">
                              <SectionShowcasePresetPreview
                                section={entry.section}
                                expanded={isExpanded}
                              />
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </LeadCaptureProvider>
    </DiscoveryProvider>
  );
}

function CategoryPill({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-[var(--ink)] text-white"
          : "border border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--line-dark)] hover:text-[var(--ink)]"
      }`}
    >
      {label}
    </button>
  );
}

function PresetMeta({
  entry,
}: {
  entry: ReturnType<typeof getSectionShowcaseCatalogEntries>[number];
}) {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="text-base font-semibold text-[var(--ink)]">{entry.label}</h3>
        <p className="mt-1 font-mono text-xs text-[var(--muted)]">{entry.presetKey}</p>
      </div>

      <dl className="space-y-3">
        <MetaRow label="CMS type">
          <code className="text-xs">{entry.section.section_type}</code>
          {entry.hasDedicatedRenderer ? (
            <span className="ml-2 text-xs text-emerald-700">dedicated renderer</span>
          ) : (
            <span className="ml-2 text-xs text-amber-700">generic fallback</span>
          )}
        </MetaRow>
        <MetaRow label="Best for">{entry.bestUseCase}</MetaRow>
        <MetaRow label="Fields">
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs text-[var(--muted)]">
            {entry.supportedFields.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </MetaRow>
        <MetaRow label="Image size">{entry.recommendedImageSize}</MetaRow>
      </dl>

      <div className="flex flex-wrap gap-1.5">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-[var(--cream-dark)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--gold)]">
        {label}
      </dt>
      <dd className="mt-1 text-[var(--ink)]">{children}</dd>
    </div>
  );
}
