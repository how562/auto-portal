import type { ReviewItem } from "@/lib/showcaseSocialProofData";
import { StarRating } from "./StarRating";

export function ReviewCard({ item }: { item: ReviewItem }) {
  return (
    <article className="flex h-full flex-col rounded-md border border-[var(--line-dark)] bg-white p-5 sm:p-6">
      <StarRating value={item.rating} size="md" />
      <h3 className="mt-3 font-semibold tracking-tight text-[var(--ink)]">{item.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
      <footer className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
        <span className="font-medium text-[var(--ink)]">{item.author}</span>
        {item.source ? <span>· {item.source}</span> : null}
        {item.date ? <span>· {item.date}</span> : null}
      </footer>
    </article>
  );
}
