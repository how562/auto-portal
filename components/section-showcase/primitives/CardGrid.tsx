import { SectionEyebrow } from "./SectionEyebrow";

export interface ShowcaseCard {
  iconLabel?: string;
  title: string;
  body: string;
}

function IconPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[var(--line-dark)] bg-[var(--cream)]"
      aria-hidden
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
    </div>
  );
}

export function CardGrid({
  eyebrow,
  headline,
  cards,
  columns = 4,
}: {
  eyebrow?: string;
  headline?: string;
  cards: ShowcaseCard[];
  columns?: 2 | 3 | 4;
}) {
  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div>
      {(eyebrow || headline) && (
        <header className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          {eyebrow ? <SectionEyebrow className="mb-4">{eyebrow}</SectionEyebrow> : null}
          {headline ? (
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              {headline}
            </h2>
          ) : null}
        </header>
      )}
      <ul className={`grid gap-6 ${colClass}`}>
        {cards.map((card) => (
          <li
            key={card.title}
            className="flex flex-col gap-4 rounded-md border border-[var(--line-dark)] bg-white p-6 shadow-[var(--shadow-tight)] transition-colors hover:border-[color-mix(in_srgb,var(--ink)_35%,var(--line-dark))]"
          >
            <IconPlaceholder label={card.iconLabel ?? "Icon"} />
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-[var(--ink)]">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{card.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
