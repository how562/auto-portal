/** @preset split_hero — saved CMS preset */
import { CTAButtons } from "@/components/section-showcase/primitives/CTAButtons";
import { HeroCollage } from "@/components/section-showcase/primitives/HeroCollage";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetSplitHero({ devLabel = "Section 01 — Split Hero" }: { devLabel?: string }) {
  return (
    <SectionShell pad="hero" className="overflow-hidden bg-[var(--cream)]" devLabel={devLabel}>
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20 xl:gap-24">
        <div className="order-1 flex max-w-xl flex-col lg:max-w-none lg:py-2">
          <SectionEyebrow className="mb-6">Premier automotive group</SectionEyebrow>
          <h1 className="headline-stack text-balance font-sans">
            <span className="block text-[clamp(2.75rem,7vw,5.25rem)] text-[var(--ink)]">
              Drive what fits
            </span>
            <span className="block text-[clamp(2.75rem,7vw,5.25rem)] text-[#9a9288]">
              your life
            </span>
          </h1>
          <p className="mt-10 max-w-[34rem] text-base leading-relaxed text-[var(--muted)] sm:text-[1.0625rem] sm:leading-[1.62]">
            Placeholder hero copy for a polished above-the-fold split layout. Pair a strong
            headline with a four-tile image collage and dual calls to action.
          </p>
          <CTAButtons
            className="mt-12"
            buttons={[
              { label: "Browse inventory", href: "/inventory", variant: "primary" },
              { label: "Find your match", href: "#guided", variant: "secondary" },
            ]}
          />
        </div>
        <div className="order-2 lg:flex lg:items-center lg:justify-end">
          <HeroCollage />
        </div>
      </div>
    </SectionShell>
  );
}
