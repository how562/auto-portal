export function DevSectionLabel({ label }: { label: string }) {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-20 sm:left-6">
      <span className="inline-block rounded-md border border-dashed border-[var(--gold)]/60 bg-[var(--cream)]/95 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)] backdrop-blur-sm">
        {label}
      </span>
    </div>
  );
}
