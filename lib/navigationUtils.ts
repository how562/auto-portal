import type { FooterNavigation } from "./navigationTypes";

const FOOTER_EXCLUDED_PATHS = new Set([
  "/locations",
  "/contact-the-cavenders",
  "#locations",
  "#locations-contact",
]);

/** Strip locations / contact links from footer nav (CMS or fallback). */
export function filterFooterNavigation(
  navigation: FooterNavigation,
): FooterNavigation {
  return {
    groups: navigation.groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const label = item.label.trim().toLowerCase();
          if (label === "locations" || label === "contact") return false;
          const href = item.href?.trim().toLowerCase() ?? "";
          if (!href) return true;
          const path = href.split("?")[0] ?? href;
          return !FOOTER_EXCLUDED_PATHS.has(path);
        }),
      }))
      .filter((group) => group.items.length > 0),
  };
}

export function scrollTargetId(href: string): string {
  const hashIndex = href.indexOf("#");
  const fragment = hashIndex >= 0 ? href.slice(hashIndex + 1) : href;
  return fragment.replace(/^\//, "");
}

export function homeHashHref(href: string): string {
  return `/#${scrollTargetId(href)}`;
}
