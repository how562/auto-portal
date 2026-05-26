import "server-only";

import type { FacebookFeedResult, FacebookPost } from "@/lib/facebookFeedShared";
export type { FacebookFeedResult, FacebookPost } from "@/lib/facebookFeedShared";

const GRAPH_VERSION = "v21.0";
const POST_LIMIT = 10;
const CACHE_SECONDS = 60 * 30;

type GraphAttachment = {
  media?: { image?: { src?: string } };
  url?: string;
  title?: string;
  subattachments?: { data?: GraphAttachment[] };
};

type GraphPost = {
  id?: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  full_picture?: string;
  attachments?: { data?: GraphAttachment[] };
};

function getPageUrl(): string {
  return (
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL?.trim() ||
    "https://www.facebook.com/"
  );
}

function pickImage(post: GraphPost): string | undefined {
  if (post.full_picture?.trim()) return post.full_picture.trim();

  const attachments = post.attachments?.data ?? [];
  for (const attachment of attachments) {
    const fromMedia = attachment.media?.image?.src?.trim();
    if (fromMedia) return fromMedia;

    for (const sub of attachment.subattachments?.data ?? []) {
      const subSrc = sub.media?.image?.src?.trim();
      if (subSrc) return subSrc;
    }
  }

  return undefined;
}

function pickLinkTitle(post: GraphPost): string | undefined {
  const attachment = post.attachments?.data?.[0];
  return attachment?.title?.trim() || undefined;
}

function normalizePost(post: GraphPost): FacebookPost | null {
  if (!post.id || !post.permalink_url || !post.created_time) return null;

  const message = post.message?.trim() ?? "";
  const imageUrl = pickImage(post);

  if (!message && !imageUrl) return null;

  return {
    id: post.id,
    message,
    createdTime: post.created_time,
    permalinkUrl: post.permalink_url,
    imageUrl,
    linkTitle: pickLinkTitle(post),
  };
}

function formatGraphError(body: unknown): string {
  if (body && typeof body === "object" && "error" in body) {
    const err = (body as { error?: { message?: string } }).error;
    if (err?.message) return err.message;
  }
  return "Facebook feed request failed.";
}

/** Server-only: loads recent Page posts via Meta Graph API. */
export async function fetchFacebookFeed(): Promise<FacebookFeedResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID?.trim();
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
  const pageUrl = getPageUrl();
  const pageName = process.env.FACEBOOK_PAGE_NAME?.trim();

  if (!pageId || !accessToken) {
    return { posts: [], configured: false, pageUrl, pageName };
  }

  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${pageId}/posts`);
  url.searchParams.set(
    "fields",
    "id,message,created_time,permalink_url,full_picture,attachments{media,url,title,subattachments}",
  );
  url.searchParams.set("limit", String(POST_LIMIT));
  url.searchParams.set("access_token", accessToken);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: CACHE_SECONDS },
    });

    const body = (await response.json()) as { data?: GraphPost[]; error?: { message?: string } };

    if (!response.ok) {
      return {
        posts: [],
        configured: true,
        pageUrl,
        pageName,
        error: formatGraphError(body),
      };
    }

    const posts = (body.data ?? [])
      .map(normalizePost)
      .filter((post): post is FacebookPost => post != null);

    return { posts, configured: true, pageUrl, pageName };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unknown error";
    return {
      posts: [],
      configured: true,
      pageUrl,
      pageName,
      error: message,
    };
  }
}
