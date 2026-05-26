/**
 * @preset form_compact — short inquiry with topic chips
 */
import { FormPlaceholder } from "@/components/section-showcase/primitives/FormPlaceholder";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { cardMemoNarrow } from "@/lib/cardClasses";

const TOPICS = ["Sales", "Service", "Parts", "General"];

export function PresetFormCompact({
  devLabel = "Form 02 — Compact inquiry",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" className="bg-[var(--cream-dark)]/30" devLabel={devLabel}>
      <div className={cardMemoNarrow}>
        <SectionEyebrow className="mb-3">Quick inquiry</SectionEyebrow>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Send a short note
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Compact form for sidebar pages or footer-adjacent contact blocks.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <span
              key={topic}
              className="rounded-md border border-[var(--line-dark)] bg-[var(--cream)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)]"
            >
              {topic}
            </span>
          ))}
        </div>
        <div className="mt-8">
          <FormPlaceholder submitLabel="Submit inquiry" />
        </div>
      </div>
    </SectionShell>
  );
}
