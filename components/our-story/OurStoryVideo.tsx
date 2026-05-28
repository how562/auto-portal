import { OurStoryVideoFrame } from "@/components/our-story/OurStoryVideoFrame";
import type { OurStoryPageContent } from "@/lib/ourStoryPageContent";

/** Standalone video section (legacy layout). Prefer OurStoryHero for the live page. */
export function OurStoryVideo({
  video,
}: {
  video: OurStoryPageContent["video"];
}) {
  return (
    <section className="story-video" aria-labelledby="story-video-heading">
      <div className="portal-container story-video__inner">
        <div>
          <h2 id="story-video-heading" className="story-video__heading">
            {video.heading}
          </h2>
          <p className="story-video__desc">{video.description}</p>
        </div>
        <OurStoryVideoFrame video={video} />
      </div>
    </section>
  );
}
