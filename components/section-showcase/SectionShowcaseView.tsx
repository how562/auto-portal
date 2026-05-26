"use client";

import Link from "next/link";
import { CMSSectionRenderer } from "@/components/cms/CMSSectionRenderer";
import { LayoutLibraryPreview } from "@/components/section-showcase/LayoutLibraryPreview";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { LAYOUT_LIBRARY_PRESET_DEFS } from "@/lib/layoutLibraryPresets";
import {
  getSectionShowcaseEntries,
  SECTION_SHOWCASE_PRESET_COUNT,
} from "@/lib/sectionShowcasePresets";

const TOTAL_CATALOG_COUNT =
  SECTION_SHOWCASE_PRESET_COUNT + LAYOUT_LIBRARY_PRESET_DEFS.length;

export function SectionShowcaseView() {
  const entries = getSectionShowcaseEntries();

  return (
    <DiscoveryProvider>
      <LeadCaptureProvider>
        <div className="min-h-screen bg-[var(--cream)] pb-20 pt-8 sm:pt-12">
          <div className="portal-container space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              CMS layout kit
            </p>
            <h1 className="headline-stack text-3xl sm:text-4xl">Section showcase</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              {TOTAL_CATALOG_COUNT} premade layout presets — visual reference for
              homepage layouts and CMS section variants. Sample copy and settings only
              (not from the database).
            </p>
            <p className="text-sm">
              <Link
                href="/admin/section-showcase"
                className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
              >
                Browse the admin catalog
              </Link>{" "}
              for metadata, filters, and side-by-side comparisons.
            </p>
            <Link
              href="/"
              className="inline-flex text-sm font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
            >
              ← Home
            </Link>
          </div>

          <div className="mt-10 space-y-16 sm:space-y-20">
            {LAYOUT_LIBRARY_PRESET_DEFS.map((preset) => (
              <section
                key={preset.id}
                id={`layout-${preset.id}`}
                className="scroll-mt-24"
              >
                <div className="portal-container mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--line)] pb-3">
                  <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
                    {preset.label}
                  </h2>
                  <code className="rounded bg-white px-2 py-0.5 text-xs text-[var(--muted)]">
                    homepage-layout
                  </code>
                  <span className="text-xs font-medium text-sky-700">saved for reuse</span>
                  <p className="w-full text-sm text-[var(--muted)]">{preset.description}</p>
                </div>
                <LayoutLibraryPreview layoutId={preset.id} expanded />
              </section>
            ))}

            {entries.map((entry) => (
              <section
                key={entry.section.id}
                id={entry.section.id}
                className="scroll-mt-24"
              >
                <div className="portal-container mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--line)] pb-3">
                  <h2 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
                    {entry.label}
                  </h2>
                  <code className="rounded bg-white px-2 py-0.5 text-xs text-[var(--muted)]">
                    {entry.section.section_type}
                  </code>
                  <span className="text-xs text-[var(--muted)]">
                    {entry.sectionTypeLabel}
                  </span>
                  {entry.hasDedicatedRenderer ? (
                    <span className="text-xs font-medium text-emerald-700">
                      dedicated renderer
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-amber-700">
                      generic fallback
                    </span>
                  )}
                  <p className="w-full text-sm text-[var(--muted)]">{entry.description}</p>
                </div>
                <CMSSectionRenderer sections={[entry.section]} />
              </section>
            ))}
          </div>
        </div>
      </LeadCaptureProvider>
    </DiscoveryProvider>
  );
}
