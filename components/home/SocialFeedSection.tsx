"use client";

import { useMemo } from "react";
import { SocialFeedCarousel } from "@/components/home/SocialFeedCarousel";
import { SocialFeedFollowCta } from "@/components/home/SocialFeedFollowCta";
import type { FacebookFeedResult } from "@/lib/facebookFeedShared";
import type { FacebookPageConfig } from "@/lib/facebookPageConfig";
import { FOOTER_SOCIAL_LINKS } from "@/lib/footerSocial";
import { getHomepageSocialFeedPosts } from "@/lib/socialFeedPosts";
import { isSocialFeedPlaceholderMode } from "@/lib/socialFeedPlaceholder";

interface SocialFeedSectionProps {
  page: FacebookPageConfig;
  graphFeed?: FacebookFeedResult | null;
}

function socialProfileUrl(platform: "facebook" | "instagram"): string {
  const link = FOOTER_SOCIAL_LINKS.find((l) => l.id === platform);
  return link?.href ?? "https://www.instagram.com/";
}

/**
 * Premium community social carousel — placeholder posts until live API is ready.
 * Set NEXT_PUBLIC_SOCIAL_FEED_MODE=live for Facebook Graph posts (falls back to placeholders).
 */
export function SocialFeedSection({ page, graphFeed }: SocialFeedSectionProps) {
  const facebookUrl = page.pageUrl;
  const instagramUrl =
    process.env.NEXT_PUBLIC_INSTAGRAM_PAGE_URL?.trim() ||
    socialProfileUrl("instagram");

  const pageName = graphFeed?.pageName ?? page.pageName ?? "Cavender Auto Group";

  const posts = useMemo(() => {
    const useLive =
      !isSocialFeedPlaceholderMode() && (graphFeed?.posts?.length ?? 0) > 0;
    return getHomepageSocialFeedPosts(
      useLive ? graphFeed?.posts : undefined,
      pageName,
    );
  }, [graphFeed?.posts, pageName]);

  return (
    <section
      id="social-feed"
      className="homepage-social-feed scroll-mt-20"
      aria-labelledby="social-feed-heading"
    >
      <div className="portal-container relative z-[1]">
        <header className="social-feed-header flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              Community
            </p>
            <h2
              id="social-feed-heading"
              className="mt-2 font-sans text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.75rem]"
            >
              Around the Cavender Family
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-[15px] sm:leading-[1.55]">
              Real moments from our dealerships, our team, and our community.
            </p>
          </div>

          <SocialFeedFollowCta
            facebookUrl={facebookUrl}
            instagramUrl={instagramUrl}
          />
        </header>

        <SocialFeedCarousel posts={posts} />
      </div>
    </section>
  );
}
