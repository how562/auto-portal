export function MapPlaceholder({
  label = "Map embed",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-md border border-[var(--line-dark)] bg-[var(--cream-dark)] ${className}`.trim()}
      aria-label={`${label} placeholder`}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden
      />
      <div className="relative flex h-full min-h-[inherit] flex-col items-center justify-center gap-3 p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[var(--shadow-tight)]">
          <svg className="h-6 w-6 text-[var(--ink)]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
          </svg>
        </div>
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          {label}
        </p>
      </div>
    </div>
  );
}
