export type OurStoryVideoEmbed =
  | { kind: "youtube"; embedUrl: string }
  | { kind: "vimeo"; embedUrl: string }
  | { kind: "native"; src: string }
  | { kind: "none" };

export function resolveOurStoryVideoEmbed(videoUrl: string): OurStoryVideoEmbed {
  const trimmed = videoUrl.trim();
  if (!trimmed) return { kind: "none" };

  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i,
  );
  if (youtubeMatch) {
    return {
      kind: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?rel=0`,
    };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch) {
    return {
      kind: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  return { kind: "native", src: trimmed };
}
