/**
 * @preset page_header_card — matches CMS hero card (cardHeroLight / cardHeroDark)
 */
import { CTAButtons } from "@/components/section-showcase/primitives/CTAButtons";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { cardHeroLight } from "@/lib/cardClasses";

export function PresetPageHeaderCard({
  devLabel = "Header 01 — Page card (current CMS)",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" devLabel={devLabel}>
      <div className={cardHeroLight}>
        <SectionEyebrow className="mb-4">About us</SectionEyebrow>
        <h1 className="headline-stack text-4xl text-[var(--ink)] sm:text-5xl lg:text-6xl">
          Our story across the region
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Current inner-page header: boxed card with eyebrow, headline, and optional subcopy —
          same pattern as the live CMS hero section.
        </p>
        <CTAButtons
          className="mt-10"
          buttons={[{ label: "Meet the team", href: "#", variant: "primary" }]}
        />
      </div>
    </SectionShell>
  );
}
