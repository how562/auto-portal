import { resolveOurStoryVideoEmbed } from "@/lib/ourStoryVideoEmbed";
import type { OurStoryPageContent } from "@/lib/ourStoryPageContent";

export function OurStoryVideo({
  video,
}: {
  video: OurStoryPageContent["video"];
}) {
  const embed = resolveOurStoryVideoEmbed(video.videoUrl);

  return (
    <section className="story-video" aria-labelledby="story-video-heading">
      <div className="portal-container story-video__inner">
        <div>
          <h2 id="story-video-heading" className="story-video__heading">
            {video.heading}
          </h2>
          <p className="story-video__desc">{video.description}</p>
        </div>
        <div className="story-video__frame-wrap">
          {embed.kind === "youtube" || embed.kind === "vimeo" ? (
            <iframe
              src={embed.embedUrl}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : embed.kind === "native" ? (
            <video src={embed.src} controls poster={video.posterImage || undefined}>
              <track kind="captions" />
            </video>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.posterImage}
                alt=""
                className="story-video__poster"
              />
              <div className="story-video__placeholder">
                Add a video URL in the CMS to feature your Cavender story film.
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
