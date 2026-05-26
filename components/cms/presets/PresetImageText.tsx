/** @preset image_text — saved */
import { CTAButtons } from "@/components/section-showcase/primitives/CTAButtons";
import { PlaceholderImage } from "@/components/section-showcase/primitives/PlaceholderImage";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetImageText({ devLabel = "Section 03 — Image + Text" }: { devLabel?: string }) {
  return (
    <SectionShell devLabel={devLabel}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <PlaceholderImage label="Service image" aspect="video" className="min-h-[16rem] lg:min-h-[22rem]" fill />
        </div>
        <div className="order-1 flex flex-col justify-center lg:order-2">
          <SectionEyebrow className="mb-4">Service & care</SectionEyebrow>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            Ownership support that stays with you
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[var(--muted)]">
            Image-left layouts suit about pages and feature stories. Text stacks first on mobile.
          </p>
          <CTAButtons
            className="mt-8"
            buttons={[{ label: "Explore services", href: "#", variant: "primary" }]}
          />
        </div>
      </div>
    </SectionShell>
  );
}
