/** @preset reviews_summary — aggregate rating + review highlights */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { StarRating } from "@/components/section-showcase/primitives/StarRating";
import {
  REVIEW_SUMMARY,
  SHOWCASE_REVIEWS,
  type ReviewItem,
} from "@/lib/showcaseSocialProofData";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetReviewsSummary({
  reviews = SHOWCASE_REVIEWS.slice(0, 3),
  summary = REVIEW_SUMMARY,
  copy = {
    eyebrow: "Reviews",
    headline: "Trusted by local drivers",
    body: "Star aggregate and highlight snippets — sync from Google or your review provider later.",
  },
  devLabel = "Reviews 01 — Summary band",
}: {
  reviews?: ReviewItem[];
  summary?: typeof REVIEW_SUMMARY;
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell dark fullBleed devLabel={devLabel}>
      <div className="portal-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14">
          <div className="text-center lg:text-left">
            <PresetSectionIntro copy={copy} align="left" onDark className="mb-6 sm:mb-8" />
            <div className="flex flex-col items-center gap-2 lg:items-start">
              <p className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                {summary.average}
              </p>
              <StarRating value={summary.average} size="md" />
              <p className="text-sm text-white/70">
                Based on {summary.count.toLocaleString()} reviews
              </p>
            </div>
          </div>
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-md border border-white/15 bg-white/5 px-5 py-4 backdrop-blur-sm"
              >
                <StarRating value={r.rating} />
                <p className="mt-2 text-sm leading-relaxed text-white/85">&ldquo;{r.body}&rdquo;</p>
                <p className="mt-2 text-xs text-white/55">
                  {r.author}
                  {r.source ? ` · ${r.source}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}
