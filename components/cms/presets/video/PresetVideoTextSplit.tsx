/** @preset video_text_split */
import { CTAButtons } from "@/components/section-showcase/primitives/CTAButtons";
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { VideoPlaceholder } from "@/components/section-showcase/primitives/VideoPlaceholder";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

export function PresetVideoTextSplit({
  copy = {
    eyebrow: "Virtual tour",
    headline: "Walk the showroom online",
    body: "Pair a supporting video with copy and a single CTA — text first on mobile.",
  },
  devLabel = "Video 02 — Video + text",
}: {
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell devLabel={devLabel}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="order-2 lg:order-1">
          <VideoPlaceholder label="Tour video" className="w-full" />
        </div>
        <div className="order-1 lg:order-2">
          <PresetSectionIntro copy={copy} align="left" />
          <CTAButtons
            className="mt-8"
            buttons={[{ label: "Schedule a visit", href: "#", variant: "primary" }]}
          />
        </div>
      </div>
    </SectionShell>
  );
}
