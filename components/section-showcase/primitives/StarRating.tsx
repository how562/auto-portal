export function StarRating({
  value,
  max = 5,
  size = "sm",
}: {
  value: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const starClass = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value);
        return (
          <svg
            key={i}
            className={`${starClass} ${filled ? "text-[var(--gold)]" : "text-[var(--line-dark)]"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.8.94-5.5-4-3.9 5.53-.8L10 1.5z" />
          </svg>
        );
      })}
    </div>
  );
}
