import type { AdminSitePageListItem } from "@/lib/cmsTypes";
import { CMS_DEMO_SLUG } from "@/lib/cmsDemoConstants";

export const HOME_PAGE_SLUG = "home";

export function findCmsDemoPage(
  pages: AdminSitePageListItem[],
): AdminSitePageListItem | null {
  return pages.find((p) => p.slug === CMS_DEMO_SLUG) ?? null;
}

/** Label shown in admin lists (homepage is the site root). */
export function getSitePageDisplayTitle(page: Pick<AdminSitePageListItem, "slug" | "title">): string {
  if (page.slug === HOME_PAGE_SLUG) return "Homepage";
  if (page.slug === CMS_DEMO_SLUG) return "CMS Demo";
  return page.title;
}

export function getSitePageLiveHref(page: Pick<AdminSitePageListItem, "slug">): string {
  if (page.slug === HOME_PAGE_SLUG) return "/";
  return `/${page.slug}`;
}

export function formatSitePageUpdatedAt(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Default admin table order: homepage first, then most recently updated. */
export function sortAllPagesForAdmin(pages: AdminSitePageListItem[]): AdminSitePageListItem[] {
  return [...pages].sort((a, b) => {
    if (a.slug === HOME_PAGE_SLUG && b.slug !== HOME_PAGE_SLUG) return -1;
    if (b.slug === HOME_PAGE_SLUG && a.slug !== HOME_PAGE_SLUG) return 1;

    const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
    const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
    if (bTime !== aTime) return bTime - aTime;

    return a.slug.localeCompare(b.slug, undefined, { sensitivity: "base" });
  });
}

export function filterAdminSitePages(
  pages: AdminSitePageListItem[],
  options: { query?: string },
): AdminSitePageListItem[] {
  const query = options.query?.trim().toLowerCase() ?? "";

  return pages.filter((page) => {
    if (!query) return true;

    const title = getSitePageDisplayTitle(page).toLowerCase();
    const haystack = `${title} ${page.title.toLowerCase()} ${page.slug.toLowerCase()} ${page.status}`;
    return haystack.includes(query);
  });
}

function sortByTitle(pages: AdminSitePageListItem[]): AdminSitePageListItem[] {
  return [...pages].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: "base" }),
  );
}

/** Published pages for Live — homepage first, excludes CMS demo. */
export function sortLivePagesForAdmin(
  pages: AdminSitePageListItem[],
): AdminSitePageListItem[] {
  const published = pages.filter((p) => p.status === "published");
  const home = published.find((p) => p.slug === HOME_PAGE_SLUG);
  const rest = sortByTitle(published.filter((p) => p.slug !== HOME_PAGE_SLUG));
  return home ? [home, ...rest] : rest;
}

export function sortDraftPagesForAdmin(
  pages: AdminSitePageListItem[],
): AdminSitePageListItem[] {
  return sortByTitle(pages.filter((p) => p.status !== "published"));
}

export function partitionAdminSitePages(pages: AdminSitePageListItem[]): {
  live: AdminSitePageListItem[];
  drafts: AdminSitePageListItem[];
  cmsDemo: AdminSitePageListItem | null;
} {
  const cmsDemo = pages.find((p) => p.slug === CMS_DEMO_SLUG) ?? null;
  const sitePages = pages.filter((p) => p.slug !== CMS_DEMO_SLUG);
  return {
    live: sortLivePagesForAdmin(sitePages),
    drafts: sortDraftPagesForAdmin(sitePages),
    cmsDemo,
  };
}
