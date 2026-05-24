import {
  FALLBACK_FOOTER_NAV,
  FALLBACK_HEADER_NAV,
} from "./navigationFallback";
import type {
  FooterNavLink,
  FooterNavigation,
  HeaderNavItem,
  HeaderNavigation,
  NavLinkKind,
  NavigationLocation,
  PortalNavigation,
} from "./navigationTypes";
import type { ManagedLinkRow } from "./managedLinksTypes";
import { PORTAL_CTA_FALLBACKS, PORTAL_CTA_KEYS } from "./portalCtaFallbacks";
import type { PortalCtaKey, PortalCtaMap, PortalCtaValue } from "./portalCtaTypes";
import type { LeadAction } from "./leads";
import { getSupabase } from "./supabase";

const MANAGED_LINK_SELECT =
  "link_key, link_type, menu_location, parent_key, is_group, label, label_es, url, sort_order, opens_new_tab, is_active";

function isMissingTableError(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    msg.includes("Could not find the table") ||
    msg.includes("schema cache")
  );
}

function sortByOrder<T extends { sort_order: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order);
}

function itemHref(row: ManagedLinkRow): string | null {
  const href = row.url?.trim();
  return href || null;
}

function parseLeadAction(href: string | null): LeadAction | undefined {
  if (!href) return undefined;
  if (href === "action:general-shortlist") return "general-shortlist";
  if (href.startsWith("action:")) {
    const action = href.slice("action:".length) as LeadAction;
    if (
      action === "general-shortlist" ||
      action === "shortlist" ||
      action === "availability" ||
      action === "compare"
    ) {
      return action;
    }
  }
  return undefined;
}

function classifyHref(href: string): NavLinkKind {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return "external";
  }
  if (href.startsWith("#") || href.includes("#")) {
    return "hash";
  }
  return "route";
}

function rowToHeaderItem(row: ManagedLinkRow): HeaderNavItem {
  const href = itemHref(row);
  const label_es = row.label_es?.trim() || null;
  const action = parseLeadAction(href);
  if (action) {
    return { id: row.link_key, label: row.label, label_es, action };
  }

  if (!href) {
    return { id: row.link_key, label: row.label, label_es };
  }

  const opensInNewTab = row.opens_new_tab === true;
  return {
    id: row.link_key,
    label: row.label,
    label_es,
    href,
    linkKind: opensInNewTab ? "external" : classifyHref(href),
    opensInNewTab,
  };
}

function rowToFooterLink(row: ManagedLinkRow): FooterNavLink {
  const href = itemHref(row);
  const label_es = row.label_es?.trim() || null;
  const action = parseLeadAction(href);
  if (action) {
    return { id: row.link_key, label: row.label, label_es, action };
  }

  if (!href) {
    return { id: row.link_key, label: row.label, label_es };
  }

  const opensInNewTab = row.opens_new_tab === true;
  return {
    id: row.link_key,
    label: row.label,
    label_es,
    href,
    linkKind: opensInNewTab ? "external" : classifyHref(href),
    opensInNewTab,
  };
}

function navRowsForLocation(
  rows: ManagedLinkRow[],
  location: NavigationLocation,
): ManagedLinkRow[] {
  return rows.filter(
    (row) =>
      row.link_type === "nav" &&
      row.menu_location === location &&
      row.is_active !== false,
  );
}

export function buildHeaderNavigation(rows: ManagedLinkRow[]): HeaderNavigation | null {
  const active = sortByOrder(
    navRowsForLocation(rows, "header").filter((row) => !row.is_group),
  );
  if (active.length === 0) return null;

  const childrenByParent = new Map<string, ManagedLinkRow[]>();
  for (const item of active) {
    if (!item.parent_key) continue;
    const siblings = childrenByParent.get(item.parent_key) ?? [];
    siblings.push(item);
    childrenByParent.set(item.parent_key, siblings);
  }

  const roots = active.filter((item) => !item.parent_key);

  return {
    items: roots.map((root) => {
      const children = sortByOrder(childrenByParent.get(root.link_key) ?? []).map(
        (child) => rowToHeaderItem(child),
      );
      const node = rowToHeaderItem(root);
      if (children.length > 0) {
        node.children = children;
      }
      return node;
    }),
  };
}

export function buildFooterNavigation(rows: ManagedLinkRow[]): FooterNavigation | null {
  const active = sortByOrder(navRowsForLocation(rows, "footer"));
  const groups = active.filter((row) => row.is_group === true);
  if (groups.length === 0) return null;

  const childrenByParent = new Map<string, ManagedLinkRow[]>();
  for (const item of active) {
    if (item.is_group || !item.parent_key) continue;
    const siblings = childrenByParent.get(item.parent_key) ?? [];
    siblings.push(item);
    childrenByParent.set(item.parent_key, siblings);
  }

  const built = {
    groups: groups.map((group) => ({
      title: group.label,
      title_es: group.label_es?.trim() || null,
      items: sortByOrder(childrenByParent.get(group.link_key) ?? []).map((child) =>
        rowToFooterLink(child),
      ),
    })),
  };

  if (built.groups.length === 0) return null;
  return built;
}

function isPortalCtaKey(key: string): key is PortalCtaKey {
  return (PORTAL_CTA_KEYS as string[]).includes(key);
}

function mergeCtaValue(
  key: PortalCtaKey,
  row: Partial<PortalCtaValue> | undefined,
): PortalCtaValue {
  const fallback = PORTAL_CTA_FALLBACKS[key];
  const label = row?.label?.trim();
  const labelEs = row?.labelEs?.trim();
  const urlRaw = row?.url;
  const url =
    urlRaw !== undefined && urlRaw !== null && urlRaw.trim() !== ""
      ? urlRaw.trim()
      : fallback.url;
  return {
    label: label || fallback.label,
    labelEs: labelEs || fallback.labelEs,
    url,
  };
}

export function buildPortalCtaMap(rows: ManagedLinkRow[]): PortalCtaMap {
  const overrides: Partial<Record<PortalCtaKey, PortalCtaValue>> = {};

  for (const row of rows) {
    if (row.link_type !== "cta" || row.is_active === false) continue;
    if (!isPortalCtaKey(row.link_key)) continue;
    overrides[row.link_key] = {
      label: row.label?.trim() ?? "",
      labelEs: row.label_es?.trim() || null,
      url: row.url?.trim() || null,
    };
  }

  const map = {} as PortalCtaMap;
  for (const key of PORTAL_CTA_KEYS) {
    map[key] = mergeCtaValue(key, overrides[key]);
  }
  return map;
}

export function getDefaultPortalCtaMap(): PortalCtaMap {
  return buildPortalCtaMap([]);
}

export function buildPortalNavigation(rows: ManagedLinkRow[]): PortalNavigation {
  return {
    header: buildHeaderNavigation(rows) ?? FALLBACK_HEADER_NAV,
    footer: buildFooterNavigation(rows) ?? FALLBACK_FOOTER_NAV,
  };
}

export async function fetchManagedLinkRows(): Promise<ManagedLinkRow[] | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data, error } = await supabase
    .from("portal_managed_links")
    .select(MANAGED_LINK_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return null;
    throw new Error(`Failed to load portal_managed_links: ${error.message}`);
  }

  const rows = (data ?? []) as ManagedLinkRow[];
  return rows.length > 0 ? rows : null;
}

export async function fetchPortalLinkSettings(): Promise<{
  navigation: PortalNavigation;
  ctas: PortalCtaMap;
}> {
  try {
    const rows = await fetchManagedLinkRows();
    if (!rows) {
      return {
        navigation: {
          header: FALLBACK_HEADER_NAV,
          footer: FALLBACK_FOOTER_NAV,
        },
        ctas: getDefaultPortalCtaMap(),
      };
    }
    return {
      navigation: buildPortalNavigation(rows),
      ctas: buildPortalCtaMap(rows),
    };
  } catch {
    return {
      navigation: {
        header: FALLBACK_HEADER_NAV,
        footer: FALLBACK_FOOTER_NAV,
      },
      ctas: getDefaultPortalCtaMap(),
    };
  }
}

/** Load navigation from portal_managed_links; missing menu sections use hardcoded fallbacks. */
export async function fetchPortalNavigation(): Promise<PortalNavigation> {
  const { navigation } = await fetchPortalLinkSettings();
  return navigation;
}

/** Load CTAs from portal_managed_links; missing keys use PORTAL_CTA_FALLBACKS. */
export async function fetchPortalCtaSettings(): Promise<PortalCtaMap> {
  const { ctas } = await fetchPortalLinkSettings();
  return ctas;
}
