/**
 * @preset memo_simple — body copy in white memo box
 */
import { MemoBox } from "@/components/section-showcase/primitives/MemoBox";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetMemoSimple({
  devLabel = "Memo 01 — Simple notice",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" devLabel={devLabel}>
      <MemoBox>
        <p className="text-base leading-relaxed text-[var(--muted)]">
          Use memo sections for policy notes, holiday hours, disclaimers, or any short copy that
          should sit in a clean white panel without competing with surrounding layout.
        </p>
      </MemoBox>
    </SectionShell>
  );
}
