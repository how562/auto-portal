"use client";

import { useCallback, useId, useRef, useState } from "react";

export interface CommitmentVeteransVideoProps {
  sectionId: string;
  eyebrow: string;
  headline: string;
  body: string;
  videoUrl: string;
  posterUrl: string;
}

function isEmbedUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  return (
    u.includes("youtube.com") ||
    u.includes("youtu.be") ||
    u.includes("vimeo.com")
  );
}

function toEmbedSrc(url: string): string | null {
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function CommitmentVeteransVideo({
  eyebrow,
  headline,
  body,
  videoUrl,
  posterUrl,
}: CommitmentVeteransVideoProps) {
  const titleId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const embedSrc = isEmbedUrl(videoUrl) ? toEmbedSrc(videoUrl) : null;
  const hasFile = Boolean(videoUrl.trim()) && !embedSrc;

  const play = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    void el.play().then(() => setIsPlaying(true)).catch(() => setLoadError(true));
  }, []);

  return (
    <div className="cc-video" aria-labelledby={titleId}>
      <div className="cc-video__copy">
        {eyebrow ? <p className="cc-eyebrow">{eyebrow}</p> : null}
        <h2 id={titleId} className="cc-headline">
          {headline}
        </h2>
        {body ? <p className="cc-video__body">{body}</p> : null}
      </div>

      <div className="cc-video__player-wrap">
          {embedSrc ? (
            <div className="cc-video__embed">
              <iframe
                src={embedSrc}
                title={headline}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="cc-video__iframe"
              />
            </div>
          ) : (
            <div className="cc-video__player">
              {hasFile ? (
                <video
                  ref={videoRef}
                  className="cc-video__element"
                  poster={posterUrl || undefined}
                  playsInline
                  controls={isPlaying}
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={() => setLoadError(true)}
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
              ) : null}

              {!isPlaying && !loadError ? (
                <>
                  {posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={posterUrl}
                      alt=""
                      className="cc-video__poster"
                    />
                  ) : (
                    <div className="cc-video__poster cc-video__poster--empty" aria-hidden />
                  )}
                  {hasFile ? (
                    <button
                      type="button"
                      className="cc-video__play"
                      onClick={play}
                      aria-label={`Play video: ${headline}`}
                    >
                      <span className="cc-video__play-icon">
                        <PlayIcon />
                      </span>
                      <span className="cc-video__play-label">Play video</span>
                    </button>
                  ) : (
                    <p className="cc-video__unavailable">
                      Video will appear here once a file URL is configured in the admin.
                    </p>
                  )}
                </>
              ) : null}

              {loadError ? (
                <p className="cc-video__unavailable">
                  We couldn&apos;t load this video. Check the file path or upload the video to{" "}
                  <code className="text-xs">public/media/cavender-commitment/</code>.
                </p>
              ) : null}
            </div>
          )}
        </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
