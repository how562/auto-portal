/**
 * Placeholder social feed — swap images in /public/social-feed/ (see README there).
 * Set NEXT_PUBLIC_SOCIAL_FEED_MODE=live when Graph API is ready.
 */

export type SocialPlatform = "facebook" | "instagram";

export interface SocialFeedPlaceholderPost {
  id: string;
  platform: SocialPlatform;
  /** Path under /public, e.g. /social-feed/01.jpg */
  imageSrc: string;
  caption: string;
  dateLabel: string;
  href: string;
  pageName: string;
}

const FB = "https://www.facebook.com/CavenderAutoG";
const IG =
  process.env.NEXT_PUBLIC_INSTAGRAM_PAGE_URL?.trim() ||
  "https://www.instagram.com/";

/** Drop your images at these paths, or edit imageSrc below. */
export const PLACEHOLDER_SOCIAL_POSTS: SocialFeedPlaceholderPost[] = [
  {
    id: "social-1",
    platform: "facebook",
    imageSrc: "/social-feed/01.jpg",
    caption:
      "Thank you to everyone who joined us for our community drive event — your support means everything to the Cavender family.",
    dateLabel: "Mar 18, 2026",
    href: FB,
    pageName: "Cavender Auto Group",
  },
  {
    id: "social-2",
    platform: "instagram",
    imageSrc: "/social-feed/02.jpg",
    caption:
      "Weekend-ready rides are waiting on the lot. Stop by and find your perfect match.",
    dateLabel: "Mar 15, 2026",
    href: IG,
    pageName: "cavenderautogroup",
  },
  {
    id: "social-3",
    platform: "facebook",
    imageSrc: "/social-feed/03.jpg",
    caption:
      "Proud to serve drivers across Texas with trusted brands and a team that treats you like family.",
    dateLabel: "Mar 10, 2026",
    href: FB,
    pageName: "Cavender Auto Group",
  },
  {
    id: "social-4",
    platform: "instagram",
    imageSrc: "/social-feed/04.jpg",
    caption:
      "Fresh arrivals hitting the showroom floor — browse inventory online or visit us today.",
    dateLabel: "Mar 6, 2026",
    href: IG,
    pageName: "cavenderautogroup",
  },
  {
    id: "social-5",
    platform: "facebook",
    imageSrc: "/social-feed/05.jpg",
    caption:
      "Honoring those who serve — ask about exclusive savings for military and first responders.",
    dateLabel: "Mar 1, 2026",
    href: FB,
    pageName: "Cavender Auto Group",
  },
];

/** Fallback images until you add files to /public/social-feed/ */
export const SOCIAL_FEED_IMAGE_FALLBACKS: Record<string, string> = {
  "/social-feed/01.jpg": "/images/hero/community.jpg",
  "/social-feed/02.jpg": "/images/hero/lifestyle.jpg",
  "/social-feed/03.jpg": "/images/hero/vehicle.jpg",
  "/social-feed/04.jpg": "/images/hero/dealership.jpg",
  "/social-feed/05.jpg": "/images/life/family.png",
};

export function isSocialFeedPlaceholderMode(): boolean {
  return process.env.NEXT_PUBLIC_SOCIAL_FEED_MODE !== "live";
}

export function resolveSocialFeedImage(src: string): string {
  return SOCIAL_FEED_IMAGE_FALLBACKS[src] ?? src;
}
