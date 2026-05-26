/**
 * @preset page_header_image_banner
 */
import { PlaceholderImage } from "@/components/section-showcase/primitives/PlaceholderImage";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetPageHeaderImageBanner({
  devLabel = "Header 04 — Image banner",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="none" fullBleed devLabel={devLabel}>
      <div className="relative min-h-[14rem] sm:min-h-[18rem] lg:min-h-[22rem]">
        <PlaceholderImage label="Page banner" fill className="absolute inset-0 rounded-none border-0" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[var(--navy-deep)]/90 via-[var(--charcoal)]/50 to-transparent"
          aria-hidden
        />
        <div className="portal-container relative flex min-h-[inherit] items-end pb-10 pt-24 sm:pb-12 sm:pt-28">
          <div className="max-w-2xl text-white">
            <SectionEyebrow onDark className="mb-3">
              Community
            </SectionEyebrow>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Driving impact where we live
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              Photography-backed page header with gradient overlay for readable headline stack.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
