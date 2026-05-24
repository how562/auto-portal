interface MatchReasonChipsProps {
  chips: string[];
  /** Max chips shown (wraps on mobile). */
  maxVisible?: number;
  className?: string;
}

export function MatchReasonChips({
  chips,
  maxVisible = 2,
  className = "",
}: MatchReasonChipsProps) {
  if (chips.length === 0) return null;

  const visible = chips.slice(0, maxVisible);

  return (
    <ul
      className={`flex flex-wrap gap-1.5 ${className}`.trim()}
      aria-label="Why this vehicle matched"
    >
      {visible.map((label) => (
        <li key={label}>
          <span className="inline-block max-w-full truncate rounded-full bg-[var(--cream)] px-2.5 py-0.5 text-[10px] font-medium leading-snug text-[var(--ink)] ring-1 ring-[var(--line)]">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
