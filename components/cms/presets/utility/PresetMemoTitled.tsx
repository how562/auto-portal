/**
 * @preset memo_titled
 */
import { MemoBox } from "@/components/section-showcase/primitives/MemoBox";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetMemoTitled({
  devLabel = "Memo 02 — Titled notice",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" devLabel={devLabel}>
      <MemoBox>
        <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
          Scheduling note
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
          Service appointments may run 15 minutes longer during peak season. We will confirm your
          window by text the morning of your visit.
        </p>
      </MemoBox>
    </SectionShell>
  );
}
