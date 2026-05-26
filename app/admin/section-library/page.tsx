import Link from "next/link";
import nextDynamic from "next/dynamic";
import { btnSecondaryMd } from "@/lib/buttonClasses";
import { SECTION_PRESET_CATALOG } from "@/lib/sectionPresetCatalog";

export const dynamic = "force-dynamic";

const SectionLibraryClient = nextDynamic(
  () =>
    import("@/components/admin/SectionLibraryClient").then((m) => ({
      default: m.SectionLibraryClient,
    })),
  {
    loading: () => (
      <p className="text-sm text-[var(--muted)]">Loading section library…</p>
    ),
  },
);

export default function SectionLibraryPage() {
  const presetCount = SECTION_PRESET_CATALOG.length;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/pages"
          className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← Pages
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Section library</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          {presetCount} layout presets in the same categories as the page builder add-section
          picker, plus site integrations. Use{" "}
          <strong className="font-medium text-[var(--ink)]">Add section</strong> on any page to
          insert a block with starter copy and{" "}
          <code className="rounded bg-[var(--cream-dark)] px-1 text-[11px]">preset_key</code>{" "}
          stored in settings.{" "}
          <Link
            href="/admin/section-showcase"
            className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Visual catalog
          </Link>
        </p>
      </div>

      <SectionLibraryClient />

      <p className="text-sm text-[var(--muted)]">
        <Link href="/admin/pages" className={`${btnSecondaryMd} inline-flex`}>
          Back to pages
        </Link>
      </p>
    </div>
  );
}
