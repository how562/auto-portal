/** @preset text_image_editorial — saved */
import { PlaceholderImage } from "@/components/section-showcase/primitives/PlaceholderImage";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetTextImageEditorial({
  devLabel = "Section 04 — Text + Image, No CTA",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell className="bg-[var(--cream-dark)]/40" devLabel={devLabel}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="flex flex-col justify-center">
          <SectionEyebrow className="mb-4">Editorial</SectionEyebrow>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            A quieter rhythm for long-form storytelling
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--muted)]">
            Without a button, the section feels editorial and confident — ideal for heritage and
            leadership copy.
          </p>
        </div>
        <div>
          <PlaceholderImage label="Editorial portrait" aspect="portrait" className="min-h-[18rem] lg:min-h-[26rem]" fill />
        </div>
      </div>
    </SectionShell>
  );
}
