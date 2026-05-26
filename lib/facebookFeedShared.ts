export interface FacebookPost {
  id: string;
  message: string;
  createdTime: string;
  permalinkUrl: string;
  imageUrl?: string;
  linkTitle?: string;
}

export interface FacebookFeedResult {
  posts: FacebookPost[];
  configured: boolean;
  pageUrl: string;
  pageName?: string;
  error?: string;
}

export function formatFacebookPostDate(iso: string, locale = "en-US"): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function truncateFacebookMessage(message: string, max = 140): string {
  const trimmed = message.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}
