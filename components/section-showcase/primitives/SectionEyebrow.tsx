export function SectionEyebrow({
  children,
  className = "",
  onDark = false,
}: {
  children: React.ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
        onDark ? "text-[var(--gold-soft)]" : "text-[var(--gold)]"
      } ${className}`.trim()}
    >
      {children}
    </p>
  );
}
