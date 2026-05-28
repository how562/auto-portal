import { resolveOurStoryVideoEmbed } from "@/lib/ourStoryVideoEmbed";
import type { OurStoryPageContent } from "@/lib/ourStoryPageContent";

export function OurStoryVideoFrame({
  video,
}: {
  video: OurStoryPageContent["video"];
}) {
  const embed = resolveOurStoryVideoEmbed(video.videoUrl);

  return (
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
          <img src={video.posterImage} alt="" className="story-video__poster" />
          <div className="story-video__placeholder">
            Add a video URL in the CMS to feature your Cavender story film.
          </div>
        </>
      )}
    </div>
  );
}
