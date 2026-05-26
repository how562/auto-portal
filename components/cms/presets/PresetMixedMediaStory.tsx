/** @preset mixed_media_story — saved */
import { PlaceholderImage } from "@/components/section-showcase/primitives/PlaceholderImage";
import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";

export function PresetMixedMediaStory({
  devLabel = "Section 10 — Mixed Media Story",
}: {
  devLabel?: string;
}) {
  return (
    <SectionShell devLabel={devLabel}>
      <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
        <SectionEyebrow className="mb-4">Community</SectionEyebrow>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
          Stories told in rhythm
        </h2>
        <p className="mt-5 text-base leading-relaxed text-[var(--muted)]">
          Alternating image and copy blocks create an editorial campaign feel.
        </p>
      </header>

      <div className="space-y-16 sm:space-y-20 lg:space-y-24">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <PlaceholderImage label="Story A" className="min-h-[14rem] lg:min-h-[20rem]" fill />
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
              Sponsoring local teams year after year
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
              Photography leads on desktop; balanced stack on mobile.
            </p>
          </div>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
              Technician apprenticeships that stay local
            </h3>
            <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
              Flipped layout keeps the rhythm fresh as readers scroll.
            </p>
          </div>
          <PlaceholderImage label="Story B" className="min-h-[14rem] lg:min-h-[20rem]" fill />
        </div>

        <div className="overflow-hidden rounded-md border border-[var(--line-dark)]">
          <PlaceholderImage
            label="Accent — image only"
            aspect="wide"
            className="min-h-[12rem] sm:min-h-[16rem] lg:min-h-[20rem]"
            fill
          />
        </div>
      </div>
    </SectionShell>
  );
}
