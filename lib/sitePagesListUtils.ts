import type { SitePage } from "@/lib/cmsTypes";
import { CMS_DEMO_SLUG } from "@/lib/cmsDemoConstants";

export const HOME_PAGE_SLUG = "home";

/** Label shown in admin lists (homepage is the site root). */
export function getSitePageDisplayTitle(page: SitePage): string {
  if (page.slug === HOME_PAGE_SLUG) return "Homepage";
  if (page.slug === CMS_DEMO_SLUG) return "CMS Demo";
  return page.title;
}

export function getSitePageLiveHref(page: SitePage): string {
  if (page.slug === HOME_PAGE_SLUG) return "/";
  return `/${page.slug}`;
}

function sortByTitle(pages: SitePage[]): SitePage[] {
  return [...pages].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  );
}

/** Published pages for Live list — homepage first, excludes CMS demo. */
export function sortLivePagesForAdmin(pages: SitePage[]): SitePage[] {
  const published = pages.filter(
    (p) => p.status === "published" && p.slug !== CMS_DEMO_SLUG,
  );
  const home = published.find((p) => p.slug === HOME_PAGE_SLUG);
  const rest = sortByTitle(published.filter((p) => p.slug !== HOME_PAGE_SLUG));
  return home ? [home, ...rest] : rest;
}

export function sortDraftPagesForAdmin(pages: SitePage[]): SitePage[] {
  return sortByTitle(
    pages.filter((p) => p.status !== "published" && p.slug !== CMS_DEMO_SLUG),
  );
}

export function findCmsDemoPage(pages: SitePage[]): SitePage | null {
  return pages.find((p) => p.slug === CMS_DEMO_SLUG) ?? null;
}
