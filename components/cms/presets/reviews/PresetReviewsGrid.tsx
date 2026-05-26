/** @preset reviews_grid — reviews[] repeater */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { ReviewCard } from "@/components/section-showcase/primitives/ReviewCard";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { SHOWCASE_REVIEWS, type ReviewItem } from "@/lib/showcaseSocialProofData";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetReviewsGrid({
  items = SHOWCASE_REVIEWS,
  copy = {
    eyebrow: "Recent reviews",
    headline: "Ratings with context",
    body: "Structured review cards with stars, title, body, source, and date.",
  },
  devLabel = "Reviews 02 — Card grid",
}: {
  items?: ReviewItem[];
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <li key={item.id}>
            <ReviewCard item={item} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
