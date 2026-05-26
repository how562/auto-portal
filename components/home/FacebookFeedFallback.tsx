import Link from "next/link";

interface FacebookFeedFallbackProps {
  pageUrl: string;
  pageName?: string;
  error?: string;
}

/** Compact horizontal CTA when live posts are unavailable (replaces tall iframe). */
export function FacebookFeedFallback({ pageUrl, pageName, error }: FacebookFeedFallbackProps) {
  return (
    <div className="fb-feed-fallback mt-8">
      <Link
        href={pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-start gap-3 rounded-xl border border-[var(--hp-line-cool)] bg-white p-5 shadow-[0_2px_12px_rgba(9,33,63,0.06)] transition hover:border-[#1877f2]/30 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1877f2] text-lg font-bold text-white">
            f
          </span>
          <div>
            <p className="font-semibold text-[var(--ink)]">
              View {pageName ?? "our"} latest posts on Facebook
            </p>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {error
                ? "Live feed is temporarily unavailable — open our page for the full timeline."
                : "Scroll our timeline for community stories, events, and news."}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#1877f2] px-5 py-2.5 text-sm font-semibold text-white">
          Open Facebook →
        </span>
      </Link>
    </div>
  );
}
