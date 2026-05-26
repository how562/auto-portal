type PlaceholderAspect = "square" | "video" | "portrait" | "wide" | "auto";

const ASPECT: Record<PlaceholderAspect, string> = {
  square: "aspect-square",
  video: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/9]",
  auto: "min-h-[inherit]",
};

export function PlaceholderImage({
  label = "Image placeholder",
  aspect = "video",
  className = "",
  fill = true,
}: {
  label?: string;
  aspect?: PlaceholderAspect;
  className?: string;
  fill?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-md border border-[var(--line-dark)] bg-[var(--cream-dark)] shadow-[var(--shadow-tight)] ${
        fill ? "h-full w-full" : ""
      } ${!fill ? ASPECT[aspect] : ""} ${className}`.trim()}
    >
      <div
        className={`flex w-full flex-col items-center justify-center gap-3 px-6 ${
          fill ? "h-full min-h-[inherit]" : `h-full ${ASPECT[aspect]}`
        }`}
      >
        <div
          className="flex h-11 w-11 items-center justify-center rounded-md bg-white shadow-[var(--shadow-tight)]"
          aria-hidden
        >
          <svg
            className="h-5 w-5 text-[var(--muted)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
            <path
              d="M3 16l5-5 4 4 3-3 6 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          {label}
        </p>
      </div>
    </div>
  );
}
