export function VideoPlaceholder({
  label = "Video",
  aspect = "video",
  className = "",
}: {
  label?: string;
  aspect?: "video" | "wide" | "cinema";
  className?: string;
}) {
  const aspectClass =
    aspect === "cinema"
      ? "aspect-[21/9]"
      : aspect === "wide"
        ? "aspect-[16/9]"
        : "aspect-video";

  return (
    <div
      className={`relative overflow-hidden rounded-md border border-[var(--line-dark)] bg-[var(--charcoal)] ${aspectClass} ${className}`.trim()}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-[var(--navy-deep)] to-[var(--charcoal-soft)]"
        aria-hidden
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm transition hover:bg-white/20">
          <svg className="ml-1 h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
        </div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
          {label} placeholder
        </p>
      </div>
    </div>
  );
}
