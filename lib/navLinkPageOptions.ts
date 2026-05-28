import type { AdminSitePageListItem } from "@/lib/cmsTypes";
import { CMS_DEMO_SLUG } from "@/lib/cmsDemoConstants";
import { DEDICATED_SITE_PAGES } from "@/lib/dedicatedSitePages";
import {
  getSitePageDisplayTitle,
  getSitePageLiveHref,
} from "@/lib/sitePagesListUtils";

export interface NavLinkPageOption {
  href: string;
  label: string;
}

const EXTRA_STATIC_ROUTES: NavLinkPageOption[] = [
  { href: "/inventory", label: "Inventory" },
  { href: "/finance", label: "Finance (short URL)" },
];

/** Published CMS + dedicated routes for navigation URL picker. */
export function buildNavLinkPageOptions(
  pages: AdminSitePageListItem[],
): NavLinkPageOption[] {
  const seen = new Set<string>();
  const options: NavLinkPageOption[] = [];

  function add(href: string, label: string) {
    const normalized = href.trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    options.push({ href: normalized, label });
  }

  for (const page of pages) {
    if (page.status !== "published") continue;
    if (page.slug === CMS_DEMO_SLUG) continue;
    add(getSitePageLiveHref(page), getSitePageDisplayTitle(page));
  }

  for (const dedicated of DEDICATED_SITE_PAGES) {
    add(dedicated.livePath, dedicated.title);
  }

  for (const route of EXTRA_STATIC_ROUTES) {
    add(route.href, route.label);
  }

  options.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
  );
  return options;
}

export function findNavLinkPageOption(
  options: NavLinkPageOption[],
  url: string,
): NavLinkPageOption | undefined {
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return options.find((o) => o.href === trimmed);
}
