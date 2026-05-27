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
import type { SocialFeedBackupPost } from "@/lib/socialFeedTypes";

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

export function cmsPostsToSocialFeedPosts(
  posts: SocialFeedBackupPost[],
): SocialFeedPost[] {
  return posts
    .filter((post) => post.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((post) => ({
      id: post.id,
      platform: post.platform,
      imageSrc: resolveSocialFeedImage(
        post.image_url.trim() || "/images/hero/community.jpg",
      ),
      caption: post.caption,
      dateLabel: post.date_label,
      href: post.href,
      pageName: post.page_name,
    }));
}

export function getHomepageSocialFeedPosts(
  livePosts: FacebookPost[] | undefined,
  pageName: string,
  backupPosts?: SocialFeedBackupPost[],
): SocialFeedPost[] {
  if (livePosts && livePosts.length > 0) {
    return facebookPostsToSocialFeed(livePosts, pageName);
  }
  if (backupPosts && backupPosts.length > 0) {
    const active = cmsPostsToSocialFeedPosts(backupPosts);
    if (active.length > 0) return active;
  }
  return placeholderToSocialFeedPosts(PLACEHOLDER_SOCIAL_POSTS);
}
