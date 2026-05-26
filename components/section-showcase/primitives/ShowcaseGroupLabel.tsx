export function ShowcaseGroupLabel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border-y border-[var(--line-dark)] bg-[var(--ink)] px-4 py-6 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--gold-soft)]">
        {title}
      </p>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm text-white/70">{description}</p>
      ) : null}
    </div>
  );
}
