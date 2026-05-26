/** @preset testimonial_grid — testimonials[] repeater */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { TestimonialCard } from "@/components/section-showcase/primitives/TestimonialCard";
import { SHOWCASE_TESTIMONIALS, type TestimonialItem } from "@/lib/showcaseSocialProofData";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetTestimonialGrid({
  items = SHOWCASE_TESTIMONIALS,
  copy = {
    eyebrow: "Guest stories",
    headline: "What drivers are saying",
    body: "Editorial quotes from a CMS testimonials repeater.",
  },
  devLabel = "Testimonial 01 — Card grid",
}: {
  items?: TestimonialItem[];
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <ul className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <TestimonialCard item={item} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
