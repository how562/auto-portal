/**
 * @preset page_header_minimal — breadcrumb + title
 */
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetPageHeaderMinimal({
  devLabel = "Header 05 — Minimal + breadcrumb",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" className="bg-white" devLabel={devLabel}>
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--muted)]">
          <li>
            <span className="hover:text-[var(--ink)]">Home</span>
          </li>
          <li aria-hidden className="text-[var(--line-dark)]">
            /
          </li>
          <li>
            <span className="hover:text-[var(--ink)]">Legal</span>
          </li>
          <li aria-hidden className="text-[var(--line-dark)]">
            /
          </li>
          <li className="text-[var(--ink)]">Privacy policy</li>
        </ol>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
        Privacy policy
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Last updated May 2026</p>
    </SectionShell>
  );
}
