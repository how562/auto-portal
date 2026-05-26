/** @preset text_intro — saved */
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetTextIntro({ devLabel = "Section 02 — Simple Text Intro" }: { devLabel?: string }) {
  return (
    <SectionShell className="bg-white" devLabel={devLabel}>
      <div className="mx-auto max-w-3xl text-center">
        <SectionEyebrow className="mb-5">Our mission</SectionEyebrow>
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl lg:text-[2.75rem]">
          Built for drivers who expect more than a transaction
        </h2>
        <p className="mt-8 text-base leading-relaxed text-[var(--muted)] sm:text-lg sm:leading-[1.7]">
          Centered intro sections work well for mission statements, policy summaries, or a calm
          pause between visual blocks.
        </p>
      </div>
    </SectionShell>
  );
}
