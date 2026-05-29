import { OurStoryVideoFrame } from "@/components/our-story/OurStoryVideoFrame";
import type { OurStoryPageContent } from "@/lib/ourStoryPageContent";

export function OurStoryVideoIntro({
  video,
}: {
  video: OurStoryPageContent["video"];
}) {
  return (
    <section
      className="story-opening__video-block"
      aria-labelledby="story-video-heading"
    >
      <div className="portal-container">
        <h2 id="story-video-heading" className="story-opening__video-heading">
          {video.heading}
        </h2>
        <p className="story-opening__video-desc">{video.description}</p>
        <OurStoryVideoFrame video={video} />
      </div>
    </section>
  );
}
