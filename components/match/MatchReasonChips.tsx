interface MatchReasonChipsProps {
  chips: string[];
  /** Max chips shown (wraps on mobile). */
  maxVisible?: number;
  className?: string;
  variant?: "default" | "subtle";
}

export function MatchReasonChips({
  chips,
  maxVisible = 2,
  className = "",
  variant = "default",
}: MatchReasonChipsProps) {
  if (chips.length === 0) return null;

  const visible = chips.slice(0, maxVisible);
  const chipClass =
    variant === "subtle"
      ? "inline-block max-w-full truncate rounded-full border border-[var(--line)]/80 bg-white/90 px-2 py-px text-[9px] font-medium leading-snug text-[var(--muted)] backdrop-blur-[2px]"
      : "inline-block max-w-full truncate rounded-full bg-[var(--cream)]/80 px-2.5 py-0.5 text-[10px] font-medium leading-snug text-[var(--ink)]/90 ring-1 ring-[var(--line)]/60";

  return (
    <ul
      className={`flex flex-wrap gap-1 ${className}`.trim()}
      aria-label="Why this vehicle matched"
    >
      {visible.map((label) => (
        <li key={label}>
          <span className={chipClass}>{label}</span>
        </li>
      ))}
    </ul>
  );
}
