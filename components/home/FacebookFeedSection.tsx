import Link from "next/link";
import { FacebookFeedCarousel } from "@/components/home/FacebookFeedCarousel";
import { FacebookFeedFallback } from "@/components/home/FacebookFeedFallback";
import type { FacebookFeedResult } from "@/lib/facebookFeedShared";
import type { FacebookPageConfig } from "@/lib/facebookPageConfig";

interface FacebookFeedSectionProps {
  page: FacebookPageConfig;
  graphFeed?: FacebookFeedResult | null;
}

/**
 * Horizontal Facebook feed — post cards in a swipe/scroll row (Graph API).
 * Falls back to a compact horizontal CTA bar if posts cannot be loaded.
 */
export function FacebookFeedSection({ page, graphFeed }: FacebookFeedSectionProps) {
  const title = page.pageName
    ? `From ${page.pageName} on Facebook`
    : "From our Facebook community";

  const posts = graphFeed?.posts ?? [];
  const hasPosts = posts.length > 0;

  return (
    <section
      id="facebook-feed"
      className="homepage-facebook-feed scroll-mt-20 py-14 sm:py-16"
      aria-labelledby="facebook-feed-heading"
    >
      <div className="portal-container">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              Stay connected
            </p>
            <h2
              id="facebook-feed-heading"
              className="mt-2 font-sans text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl"
            >
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Recent posts from our Facebook page — swipe to browse.
            </p>
          </div>
          <Link
            href={page.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--hp-line-cool-dark)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-[0_1px_4px_rgba(9,33,63,0.06)] transition hover:border-[#1877f2]/35 hover:text-[#1877f2]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1877f2] text-[10px] font-bold text-white">
              f
            </span>
            Follow on Facebook
          </Link>
        </div>

        {hasPosts ? (
          <FacebookFeedCarousel
            posts={posts}
            pageUrl={graphFeed?.pageUrl ?? page.pageUrl}
            pageName={graphFeed?.pageName ?? page.pageName}
          />
        ) : (
          <FacebookFeedFallback
            pageUrl={page.pageUrl}
            pageName={page.pageName}
            error={graphFeed?.error}
          />
        )}
      </div>
    </section>
  );
}
