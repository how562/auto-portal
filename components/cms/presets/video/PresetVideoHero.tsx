/** @preset video_hero — full-width video embed */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { VideoPlaceholder } from "@/components/section-showcase/primitives/VideoPlaceholder";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetVideoHero({
  copy = {
    eyebrow: "Watch",
    headline: "See the experience before you visit",
    body: "Hero-scale video band — YouTube, Vimeo, or self-hosted embed in CMS.",
  },
  devLabel = "Video 01 — Hero video",
}: {
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell pad="tight" fullBleed devLabel={devLabel}>
      <div className="portal-container mb-8 sm:mb-10">
        <PresetSectionIntro copy={copy} />
      </div>
      <div className="portal-container">
        <VideoPlaceholder label="Hero video" aspect="cinema" />
      </div>
    </SectionShell>
  );
}
