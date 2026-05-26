/**
 * @preset page_header_compact
 */
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetPageHeaderCompact({
  devLabel = "Header 02 — Compact title",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" className="border-b border-[var(--line)]" devLabel={devLabel}>
      <div className="max-w-3xl">
        <SectionEyebrow className="mb-3">Careers</SectionEyebrow>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
          Join our team
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          Lightweight page opener without a card — ideal for utility pages and shallow content
          stacks.
        </p>
      </div>
    </SectionShell>
  );
}
