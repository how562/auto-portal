import type { AdminSitePageListItem, SitePage } from "@/lib/cmsTypes";
import { CMS_DEMO_SLUG } from "@/lib/cmsDemoConstants";
import { getDedicatedSitePage } from "@/lib/dedicatedSitePages";
import { HOME_PAGE_SLUG } from "@/lib/sitePagesListUtils";

export type SitePageDeletePolicy =
  | { canDelete: false; reason: string }
  | { canDelete: true; severity: "draft" | "published" };

type PageRef = Pick<SitePage | AdminSitePageListItem, "slug" | "status" | "title">;

export function getSitePageDeletePolicy(page: PageRef): SitePageDeletePolicy {
  if (page.slug === HOME_PAGE_SLUG) {
    return { canDelete: false, reason: "The homepage cannot be deleted." };
  }

  if (page.slug === CMS_DEMO_SLUG) {
    return {
      canDelete: false,
      reason: "The CMS Demo workbench cannot be deleted. Use the CMS Demo button to reopen it.",
    };
  }

  const dedicated = getDedicatedSitePage(page.slug);
  if (dedicated?.keepPublished) {
    return {
      canDelete: false,
      reason: `"${dedicated.title}" is a system page and cannot be deleted.`,
    };
  }

  if (page.status === "published") {
    return { canDelete: true, severity: "published" };
  }

  return { canDelete: true, severity: "draft" };
}
