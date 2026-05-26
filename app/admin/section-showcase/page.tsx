import Link from "next/link";
import nextDynamic from "next/dynamic";
import { SectionPresetCatalogPanel } from "@/components/admin/SectionPresetCatalogPanel";
import {
  PRESET_CLEANUP_SUMMARY,
  PRESET_LIBRARY_CATEGORIES,
  getCatalogCategoryCounts,
  getPickerVisiblePresets,
} from "@/lib/sectionPresetCatalog";

const SectionShowcaseView = nextDynamic(
  () =>
    import("@/components/section-showcase/SectionShowcaseView").then((m) => ({
      default: m.SectionShowcaseView,
    })),
  {
    loading: () => (
      <p className="py-12 text-center text-sm text-[var(--muted)]">Loading visual preview…</p>
    ),
  },
);

export default function AdminSectionShowcasePage() {
  const counts = getCatalogCategoryCounts();
  const pickerVisible = getPickerVisiblePresets();

  return (
    <div className="space-y-10">
      <div className="rounded-2xl border border-[var(--line)] bg-white px-6 py-6">
        <h1 className="text-xl font-semibold text-[var(--ink)]">Section preset library</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Organized catalog of {PRESET_CLEANUP_SUMMARY.showcase_total} layouts. Use{" "}
          <strong className="font-medium text-[var(--ink)]">
            {PRESET_CLEANUP_SUMMARY.picker_visible} picker-ready
          </strong>{" "}
          presets in the page builder; {PRESET_CLEANUP_SUMMARY.hide} are showcase-only;{" "}
          {PRESET_CLEANUP_SUMMARY.merge} should fold into parent presets.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/section-showcase"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Open visual preview ↗
          </Link>
          <Link
            href="/admin/section-library"
            className="text-sm font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--ink)] hover:underline"
          >
            Legacy CMS types (11)
          </Link>
        </div>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_LIBRARY_CATEGORIES.map((cat) => (
            <li
              key={cat.id}
              className={`rounded-lg border px-3 py-2 text-xs ${
                cat.id === "comparison"
                  ? "border-dashed border-[var(--line-dark)] bg-[var(--cream)]/50 text-[var(--muted)]"
                  : "border-[var(--line)] bg-[var(--cream)]/30"
              }`}
            >
              <span className="font-semibold text-[var(--ink)]">{cat.label}</span>
              <span className="ml-2 text-[var(--muted)]">
                {counts[cat.id] === 0 ? "— reserved" : counts[cat.id]}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Promoted in picker: {pickerVisible.filter((p) => p.library_visibility === "promoted").length}{" "}
          · Standard: {pickerVisible.filter((p) => p.library_visibility === "standard").length}
        </p>
      </div>

      <SectionPresetCatalogPanel />

      <div className="-mx-6 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--cream)] sm:-mx-0">
        <SectionShowcaseView />
      </div>
    </div>
  );
}
