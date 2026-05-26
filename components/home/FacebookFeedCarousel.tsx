"use client";

import Image from "next/image";
import Link from "next/link";
import {
  formatFacebookPostDate,
  truncateFacebookMessage,
  type FacebookPost,
} from "@/lib/facebookFeedShared";

interface FacebookFeedCarouselProps {
  posts: FacebookPost[];
  pageUrl: string;
  pageName?: string;
  locale?: string;
}

/** Horizontal scrolling row of wide post cards (image + copy side by side). */
export function FacebookFeedCarousel({
  posts,
  pageUrl,
  pageName,
  locale = "en-US",
}: FacebookFeedCarouselProps) {
  return (
    <div className="fb-feed-rail mt-8 sm:mt-10">
      <div className="fb-feed-rail__track" role="list" aria-label="Recent Facebook posts">
        {posts.map((post) => (
          <article
            key={post.id}
            className="fb-feed-card fb-feed-card--horizontal group"
            role="listitem"
          >
            <Link
              href={post.permalinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full min-h-[9.5rem] flex-row overflow-hidden"
            >
              <div className="relative w-[42%] max-w-[200px] shrink-0 bg-[var(--hp-gray)] sm:w-[38%]">
                {post.imageUrl ? (
                  <Image
                    src={post.imageUrl}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full min-h-[9.5rem] items-center justify-center bg-gradient-to-br from-[#1877f2]/12 to-[var(--hp-mist)]">
                    <FacebookMark className="h-9 w-9 text-[#1877f2]/65" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#1877f2]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#1877f2]">
                    Facebook
                  </span>
                  <time
                    dateTime={post.createdTime}
                    className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]"
                  >
                    {formatFacebookPostDate(post.createdTime, locale)}
                  </time>
                </div>
                {post.message ? (
                  <p className="line-clamp-3 text-sm leading-snug text-[var(--ink)]">
                    {truncateFacebookMessage(post.message, 120)}
                  </p>
                ) : post.linkTitle ? (
                  <p className="line-clamp-2 text-sm font-medium text-[var(--ink)]">
                    {post.linkTitle}
                  </p>
                ) : null}
                <span className="mt-1 text-xs font-semibold text-[#1877f2] group-hover:underline">
                  View post →
                </span>
              </div>
            </Link>
          </article>
        ))}

        <article className="fb-feed-card fb-feed-card--horizontal fb-feed-card--cta" role="listitem">
          <Link
            href={pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full min-h-[9.5rem] flex-row items-center gap-4 p-5 sm:px-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1877f2] text-white">
              <FacebookMark className="h-6 w-6" />
            </span>
            <span className="min-w-0 text-left">
              <p className="text-base font-semibold text-[var(--ink)]">
                Follow {pageName ?? "us"} on Facebook
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                See the latest community posts, events, and updates.
              </p>
            </span>
          </Link>
        </article>
      </div>
    </div>
  );
}

function FacebookMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
