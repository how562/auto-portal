import {
  formatFacebookPostDate,
  truncateFacebookMessage,
  type FacebookPost,
} from "@/lib/facebookFeedShared";
import {
  PLACEHOLDER_SOCIAL_POSTS,
  resolveSocialFeedImage,
  type SocialFeedPlaceholderPost,
  type SocialPlatform,
} from "@/lib/socialFeedPlaceholder";

export type { SocialPlatform };

/** Unified post shape for the homepage social carousel (placeholder + live). */
export interface SocialFeedPost {
  id: string;
  platform: SocialPlatform;
  imageSrc: string;
  caption: string;
  dateLabel: string;
  href: string;
  pageName: string;
}

export function placeholderToSocialFeedPosts(
  posts: SocialFeedPlaceholderPost[],
): SocialFeedPost[] {
  return posts.map((post) => ({
    ...post,
    imageSrc: resolveSocialFeedImage(post.imageSrc),
  }));
}

export function facebookPostsToSocialFeed(
  posts: FacebookPost[],
  pageName: string,
  fallbackImage = "/images/hero/community.jpg",
): SocialFeedPost[] {
  return posts.map((post) => ({
    id: post.id,
    platform: "facebook",
    imageSrc: post.imageUrl?.trim() || fallbackImage,
    caption: truncateFacebookMessage(post.message || post.linkTitle || ""),
    dateLabel: formatFacebookPostDate(post.createdTime),
    href: post.permalinkUrl,
    pageName: pageName || "Cavender Auto Group",
  }));
}

export function getHomepageSocialFeedPosts(
  livePosts: FacebookPost[] | undefined,
  pageName: string,
): SocialFeedPost[] {
  if (livePosts && livePosts.length > 0) {
    return facebookPostsToSocialFeed(livePosts, pageName);
  }
  return placeholderToSocialFeedPosts(PLACEHOLDER_SOCIAL_POSTS);
}
