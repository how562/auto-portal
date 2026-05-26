/** @preset process_horizontal — process_steps[] repeater */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import {
  SHOWCASE_PROCESS_STEPS,
  type ProcessStepItem,
} from "@/lib/showcaseProcessTimelineData";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetProcessHorizontal({
  steps = SHOWCASE_PROCESS_STEPS,
  copy = {
    eyebrow: "How it works",
    headline: "A clear path to your next vehicle",
    body: "Horizontal steps with connectors — ideal for sales or service journeys.",
  },
  devLabel = "Process 01 — Horizontal steps",
}: {
  steps?: ProcessStepItem[];
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell className="bg-white" devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.id} className="relative">
            {index < steps.length - 1 ? (
              <span
                className="absolute left-[1.35rem] top-10 hidden h-px w-[calc(100%-2rem)] bg-[var(--line-dark)] lg:block"
                aria-hidden
              />
            ) : null}
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--ink)] text-sm font-bold text-white">
              {step.step}
            </div>
            <h3 className="mt-4 text-lg font-semibold tracking-tight text-[var(--ink)]">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.body}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
