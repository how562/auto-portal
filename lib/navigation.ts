import { getSupabase } from "./supabase";
import {
  FALLBACK_FOOTER_NAV,
  FALLBACK_HEADER_NAV,
} from "./navigationFallback";
import type { LeadAction } from "./leads";
import type {
  FooterNavLink,
  FooterNavigation,
  HeaderNavItem,
  HeaderNavigation,
  NavLinkKind,
  NavigationLocation,
  PortalNavigation,
} from "./navigationTypes";

export type {
  FooterNavGroup,
  FooterNavLink,
  FooterNavigation,
  HeaderNavItem,
  HeaderNavigation,
  NavLinkKind,
  NavigationLocation,
  PortalNavigation,
} from "./navigationTypes";

interface NavigationMenuRow {
  id: string;
  location: string;
  is_active: boolean;
}

interface NavigationItemRow {
  id: string;
  menu_id: string;
  parent_id: string | null;
  label: string;
  label_es?: string | null;
  url: string | null;
  sort_order: number;
  is_active: boolean;
  opens_new_tab?: boolean;
}

const MENU_SELECT = "id, location, is_active";
const ITEM_SELECT =
  "id, menu_id, parent_id, label, label_es, url, sort_order, is_active, opens_new_tab";

function itemHref(row: NavigationItemRow): string | null {
  const href = row.url?.trim();
  return href || null;
}

function isMissingTableError(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    msg.includes("Could not find the table") ||
    msg.includes("schema cache")
  );
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

function rowToHeaderItem(row: NavigationItemRow): HeaderNavItem {
  const href = itemHref(row);
  const label_es = row.label_es?.trim() || null;
  const action = parseLeadAction(href);
  if (action) {
    return { id: row.id, label: row.label, label_es, action };
  }

  if (!href) {
    return { id: row.id, label: row.label, label_es };
  }

  const opensInNewTab = row.opens_new_tab === true;
  return {
    id: row.id,
    label: row.label,
    label_es,
    href,
    linkKind: opensInNewTab ? "external" : classifyHref(href),
    opensInNewTab,
  };
}

function rowToFooterLink(row: NavigationItemRow): FooterNavLink {
  const href = itemHref(row);
  const label_es = row.label_es?.trim() || null;
  const action = parseLeadAction(href);
  if (action) {
    return { id: row.id, label: row.label, label_es };
  }

  if (!href) {
    return { id: row.id, label: row.label, label_es };
  }

  const opensInNewTab = row.opens_new_tab === true;
  return {
    id: row.id,
    label: row.label,
    label_es,
    href,
    linkKind: opensInNewTab ? "external" : classifyHref(href),
    opensInNewTab,
  };
}

function sortByOrder<T extends { sort_order: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order);
}

function buildHeaderNavigation(items: NavigationItemRow[]): HeaderNavigation {
  const active = sortByOrder(items.filter((item) => item.is_active));
  const childrenByParent = new Map<string, NavigationItemRow[]>();

  for (const item of active) {
    if (!item.parent_id) continue;
    const siblings = childrenByParent.get(item.parent_id) ?? [];
    siblings.push(item);
    childrenByParent.set(item.parent_id, siblings);
  }

  const roots = active.filter((item) => !item.parent_id);

  return {
    items: roots.map((root) => {
      const children = sortByOrder(childrenByParent.get(root.id) ?? []).map(
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

function buildFooterNavigation(items: NavigationItemRow[]): FooterNavigation {
  const active = sortByOrder(items.filter((item) => item.is_active));
  const childrenByParent = new Map<string, NavigationItemRow[]>();

  for (const item of active) {
    if (!item.parent_id) continue;
    const siblings = childrenByParent.get(item.parent_id) ?? [];
    siblings.push(item);
    childrenByParent.set(item.parent_id, siblings);
  }

  const roots = active.filter((item) => !item.parent_id);

  return {
    groups: roots.map((root) => ({
      title: root.label,
      title_es: root.label_es?.trim() || null,
      items: sortByOrder(childrenByParent.get(root.id) ?? []).map((child) =>
        rowToFooterLink(child),
      ),
    })),
  };
}

async function fetchMenuItems(
  location: NavigationLocation,
): Promise<NavigationItemRow[] | null> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return null;
  }

  const { data: menu, error: menuError } = await supabase
    .from("navigation_menus")
    .select(MENU_SELECT)
    .eq("location", location)
    .eq("is_active", true)
    .maybeSingle();

  if (menuError) {
    if (isMissingTableError(menuError)) return null;
    throw new Error(
      `Failed to load ${location} navigation menu: ${menuError.message}`,
    );
  }

  if (!menu) return null;

  const menuRow = menu as NavigationMenuRow;

  const { data: items, error: itemsError } = await supabase
    .from("navigation_items")
    .select(ITEM_SELECT)
    .eq("menu_id", menuRow.id)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (itemsError) {
    if (isMissingTableError(itemsError)) return null;
    throw new Error(
      `Failed to load ${location} navigation items: ${itemsError.message}`,
    );
  }

  const rows = (items ?? []) as NavigationItemRow[];
  return rows.length > 0 ? rows : null;
}

export async function fetchHeaderNavigation(): Promise<HeaderNavigation> {
  const rows = await fetchMenuItems("header");
  if (!rows) return FALLBACK_HEADER_NAV;
  return buildHeaderNavigation(rows);
}

export async function fetchFooterNavigation(): Promise<FooterNavigation> {
  const rows = await fetchMenuItems("footer");
  if (!rows) return FALLBACK_FOOTER_NAV;
  const built = buildFooterNavigation(rows);
  if (built.groups.length === 0) return FALLBACK_FOOTER_NAV;
  return built;
}

export async function fetchPortalNavigation(): Promise<PortalNavigation> {
  try {
    const [header, footer] = await Promise.all([
      fetchHeaderNavigation(),
      fetchFooterNavigation(),
    ]);
    return { header, footer };
  } catch {
    return {
      header: FALLBACK_HEADER_NAV,
      footer: FALLBACK_FOOTER_NAV,
    };
  }
}

