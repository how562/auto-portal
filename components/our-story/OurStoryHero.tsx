import { OurStoryVideoFrame } from "@/components/our-story/OurStoryVideoFrame";
import type { OurStoryPageContent } from "@/lib/ourStoryPageContent";

export function OurStoryHero({
  hero,
  video,
}: {
  hero: OurStoryPageContent["hero"];
  video: OurStoryPageContent["video"];
}) {
  return (
    <section className="story-opening" aria-labelledby="story-hero-title">
      <div className="story-opening__atmosphere" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hero.imageUrl} alt="" className="story-opening__atmosphere-img" />
        <div className="story-opening__atmosphere-overlay" />
      </div>

      <div className="portal-container story-opening__grid">
        <div className="story-opening__copy">
          <p className="story-opening__eyebrow">Cavender Auto Group</p>
          <h1 id="story-hero-title" className="story-opening__title">
            {hero.title}
          </h1>
          <p className="story-opening__subtitle">{hero.subtitle}</p>
          <p className="story-opening__supporting">{hero.supportingLine}</p>
          <span className="story-opening__rule" aria-hidden />
        </div>

        <div className="story-opening__video" aria-labelledby="story-video-heading">
          <h2 id="story-video-heading" className="story-opening__video-heading">
            {video.heading}
          </h2>
          <p className="story-opening__video-desc">{video.description}</p>
          <OurStoryVideoFrame video={video} />
        </div>
      </div>

      <div className="story-opening__fade" aria-hidden />
    </section>
  );
}
