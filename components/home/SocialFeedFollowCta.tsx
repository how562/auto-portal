import Link from "next/link";
import { SocialPlatformBadge } from "@/components/home/SocialPlatformBadge";

interface SocialFeedFollowCtaProps {
  facebookUrl: string;
  instagramUrl: string;
}

export function SocialFeedFollowCta({
  facebookUrl,
  instagramUrl,
}: SocialFeedFollowCtaProps) {
  return (
    <div className="social-feed-follow-cta flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        Follow Cavender
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-feed-follow-cta__icon social-feed-follow-cta__icon--facebook"
          aria-label="Follow on Facebook"
        >
          <SocialPlatformBadge platform="facebook" className="!h-9 !w-9" />
        </Link>
        <Link
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="social-feed-follow-cta__icon social-feed-follow-cta__icon--instagram"
          aria-label="Follow on Instagram"
        >
          <SocialPlatformBadge platform="instagram" className="!h-9 !w-9" />
        </Link>
      </div>
    </div>
  );
}
