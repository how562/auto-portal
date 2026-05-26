/** @preset process_vertical — numbered vertical process */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import {
  SHOWCASE_PROCESS_STEPS,
  type ProcessStepItem,
} from "@/lib/showcaseProcessTimelineData";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetProcessVertical({
  steps = SHOWCASE_PROCESS_STEPS,
  copy = {
    eyebrow: "Your journey",
    headline: "Step by step, without surprises",
    body: "Vertical flow reads well on mobile and long-form landing pages.",
  },
  devLabel = "Process 02 — Vertical steps",
}: {
  steps?: ProcessStepItem[];
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <ol className="relative mx-auto max-w-2xl space-y-0">
        {steps.map((step, index) => (
          <li key={step.id} className="relative flex gap-6 pb-10 last:pb-0">
            {index < steps.length - 1 ? (
              <span
                className="absolute left-5 top-12 h-[calc(100%-2rem)] w-px bg-[var(--line-dark)]"
                aria-hidden
              />
            ) : null}
            <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--ink)] bg-white text-sm font-bold text-[var(--ink)]">
              {step.step}
            </div>
            <div className="pt-1">
              <h3 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
