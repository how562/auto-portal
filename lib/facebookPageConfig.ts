const PLACEHOLDER_PAGE_ID = "your_numeric_page_id";
const PLACEHOLDER_TOKEN = "your_page_access_token";

export interface FacebookPageConfig {
  pageUrl: string;
  pageName?: string;
  /** True when real Graph API credentials are set (optional custom carousel). */
  useGraphApi: boolean;
}

export function getFacebookPageConfig(): FacebookPageConfig {
  const pageUrl =
    process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL?.trim() ||
    "https://www.facebook.com/CavenderAutoG";

  const pageName = process.env.FACEBOOK_PAGE_NAME?.trim();

  const pageId = process.env.FACEBOOK_PAGE_ID?.trim();
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();

  const useGraphApi = Boolean(
    pageId &&
      token &&
      pageId !== PLACEHOLDER_PAGE_ID &&
      token !== PLACEHOLDER_TOKEN,
  );

  return { pageUrl, pageName, useGraphApi };
}

/** Meta Page Plugin iframe URL — reliable without JS SDK or access tokens. */
export function buildFacebookPagePluginUrl(
  pageUrl: string,
  options?: { width?: number; height?: number },
): string {
  const href = pageUrl.trim().replace(/\/$/, "");
  const params = new URLSearchParams({
    href,
    tabs: "timeline",
    width: String(options?.width ?? 1200),
    height: String(options?.height ?? 560),
    small_header: "false",
    adapt_container_width: "true",
    hide_cover: "true",
    show_facepile: "false",
  });

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID?.trim();
  if (appId) params.set("appId", appId);

  return `https://www.facebook.com/plugins/page.php?${params.toString()}`;
}
