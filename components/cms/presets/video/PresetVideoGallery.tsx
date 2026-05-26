/** @preset video_gallery — videos[] repeater */
import { PresetSectionIntro } from "@/components/cms/presets/shared/PresetSectionIntro";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { VideoPlaceholder } from "@/components/section-showcase/primitives/VideoPlaceholder";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";

const VIDEO_ITEMS = [
  { id: "v1", title: "Showroom tour", duration: "2:14" },
  { id: "v2", title: "Service lane walkthrough", duration: "1:48" },
  { id: "v3", title: "Customer delivery day", duration: "3:02" },
];

export function PresetVideoGallery({
  videos = VIDEO_ITEMS,
  copy = {
    eyebrow: "Videos",
    headline: "Stories from our stores",
    body: "Thumbnail row or grid from a CMS videos repeater (url, title, duration, poster).",
  },
  devLabel = "Video 03 — Video gallery",
}: {
  videos?: { id: string; title: string; duration: string }[];
  copy?: PresetSectionCopy;
  devLabel?: string;
}) {
  return (
    <SectionShell className="bg-white" devLabel={devLabel}>
      <PresetSectionIntro copy={copy} />
      <ul className="grid gap-6 sm:grid-cols-3">
        {videos.map((video) => (
          <li key={video.id}>
            <div className="group cursor-default">
              <VideoPlaceholder label={video.title} />
              <p className="mt-3 font-semibold text-[var(--ink)]">{video.title}</p>
              <p className="text-xs text-[var(--muted)]">{video.duration}</p>
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
