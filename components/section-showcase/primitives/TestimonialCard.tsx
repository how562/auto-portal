import type { TestimonialItem } from "@/lib/showcaseSocialProofData";

export function TestimonialCard({
  item,
  variant = "grid",
}: {
  item: TestimonialItem;
  variant?: "grid" | "featured";
}) {
  if (variant === "featured") {
    return (
      <blockquote className="relative rounded-md border border-[var(--line-dark)] bg-white px-8 py-10 sm:px-12 sm:py-12">
        <span
          className="font-serif text-6xl leading-none text-[var(--gold)]/40"
          aria-hidden
        >
          “
        </span>
        <p className="mt-2 text-xl leading-relaxed text-[var(--ink)] sm:text-2xl sm:leading-relaxed">
          {item.quote}
        </p>
        <footer className="mt-8 border-t border-[var(--line)] pt-6">
          <cite className="not-italic">
            <span className="font-semibold text-[var(--ink)]">{item.author}</span>
            {item.role ? (
              <span className="mt-1 block text-sm text-[var(--muted)]">{item.role}</span>
            ) : null}
          </cite>
        </footer>
      </blockquote>
    );
  }

  return (
    <blockquote className="flex h-full flex-col rounded-md border border-[var(--line-dark)] bg-white p-6 shadow-[var(--shadow-tight)] sm:p-7">
      <p className="flex-1 text-base leading-relaxed text-[var(--ink)]">&ldquo;{item.quote}&rdquo;</p>
      <footer className="mt-6 border-t border-[var(--line)] pt-4">
        <cite className="not-italic text-sm">
          <span className="font-semibold text-[var(--ink)]">{item.author}</span>
          {item.role ? <span className="block text-[var(--muted)]">{item.role}</span> : null}
          {item.location ? (
            <span className="mt-1 block text-xs text-[var(--gold)]">{item.location}</span>
          ) : null}
        </cite>
      </footer>
    </blockquote>
  );
}
