/** @preset testimonial_featured — featured_testimonial_id + testimonials[] */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { TestimonialCard } from "@/components/section-showcase/primitives/TestimonialCard";
import { SHOWCASE_TESTIMONIALS, type TestimonialItem } from "@/lib/showcaseSocialProofData";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetTestimonialFeatured({
  items = SHOWCASE_TESTIMONIALS,
  featuredId = "t1",
  copy = {
    eyebrow: "Testimonials",
    headline: "Featured guest voice",
    body: "Lead with one long-form quote; supporting quotes fill a secondary grid.",
  },
  devLabel = "Testimonial 02 — Featured quote",
}: {
  items?: TestimonialItem[];
  featuredId?: string;
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  const featured = items.find((t) => t.id === featuredId) ?? items[0];
  const rest = items.filter((t) => t.id !== featured?.id);

  if (!featured) return null;

  return (
    <SectionShell className="bg-white" devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <TestimonialCard item={featured} variant="featured" />
      {rest.length > 0 ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2">
          {rest.map((item) => (
            <li key={item.id}>
              <TestimonialCard item={item} />
            </li>
          ))}
        </ul>
      ) : null}
    </SectionShell>
  );
}
