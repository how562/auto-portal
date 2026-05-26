/**
 * @preset page_header_dark_band
 */
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetPageHeaderDarkBand({
  devLabel = "Header 03 — Dark full-width band",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" fullBleed dark devLabel={devLabel}>
      <div className="portal-container py-4 sm:py-6">
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow onDark className="mb-4">
            Service & parts
          </SectionEyebrow>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]">
            Factory-trained care for every model
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/75">
            Full-bleed charcoal band signals a new page chapter with strong contrast and centered
            hierarchy.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
