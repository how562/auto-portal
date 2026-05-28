import type { PortalManagedLinkRow } from "@/lib/managedLinksAdmin";

export type NavDisplayLevel = "top" | "child" | "group";

export interface NavDisplayItem {
  row: PortalManagedLinkRow;
  level: NavDisplayLevel;
  parentLabel?: string;
}

function sortByOrder(a: PortalManagedLinkRow, b: PortalManagedLinkRow): number {
  return a.sort_order - b.sort_order;
}

function childrenMap(
  rows: PortalManagedLinkRow[],
): Map<string, PortalManagedLinkRow[]> {
  const map = new Map<string, PortalManagedLinkRow[]>();
  for (const row of rows) {
    if (!row.parent_key) continue;
    const list = map.get(row.parent_key) ?? [];
    list.push(row);
    map.set(row.parent_key, list);
  }
  Array.from(map.values()).forEach((list) => {
    list.sort(sortByOrder);
  });
  return map;
}

/** Header nav: top-level links with dropdown children nested underneath. */
export function buildHeaderNavDisplayItems(
  rows: PortalManagedLinkRow[],
  query: string,
  matchesSearch: (row: PortalManagedLinkRow, q: string) => boolean,
): NavDisplayItem[] {
  const q = query.trim().toLowerCase();
  const navRows = rows.filter((r) => !r.is_group);
  const roots = navRows.filter((r) => !r.parent_key).sort(sortByOrder);
  const byParent = childrenMap(navRows);
  const result: NavDisplayItem[] = [];
  const placed = new Set<string>();

  for (const root of roots) {
    const children = byParent.get(root.link_key) ?? [];
    const visibleChildren = q
      ? children.filter(
          (child) => matchesSearch(child, q) || matchesSearch(root, q),
        )
      : children;
    const showRoot = !q || matchesSearch(root, q) || visibleChildren.length > 0;
    if (!showRoot) continue;

    result.push({ row: root, level: "top" });
    for (const child of visibleChildren) {
      result.push({
        row: child,
        level: "child",
        parentLabel: root.label,
      });
      placed.add(child.link_key);
    }
  }

  for (const row of navRows) {
    if (!row.parent_key || placed.has(row.link_key)) continue;
    if (q && !matchesSearch(row, q)) continue;
    const parent = navRows.find((r) => r.link_key === row.parent_key);
    result.push({
      row,
      level: "child",
      parentLabel: parent?.label ?? row.parent_key,
    });
  }

  return result;
}

/** Footer nav: column groups with links nested underneath. */
export function buildFooterNavDisplayItems(
  rows: PortalManagedLinkRow[],
  query: string,
  matchesSearch: (row: PortalManagedLinkRow, q: string) => boolean,
): NavDisplayItem[] {
  const q = query.trim().toLowerCase();
  const groups = rows.filter((r) => r.is_group).sort(sortByOrder);
  const links = rows.filter((r) => !r.is_group && r.parent_key);
  const byParent = childrenMap(links);
  const result: NavDisplayItem[] = [];
  const placed = new Set<string>();

  for (const group of groups) {
    const children = byParent.get(group.link_key) ?? [];
    const visibleChildren = q
      ? children.filter(
          (child) => matchesSearch(child, q) || matchesSearch(group, q),
        )
      : children;
    const showGroup = !q || matchesSearch(group, q) || visibleChildren.length > 0;
    if (!showGroup) continue;

    result.push({ row: group, level: "group" });
    for (const child of visibleChildren) {
      result.push({
        row: child,
        level: "child",
        parentLabel: group.label,
      });
      placed.add(child.link_key);
    }
  }

  for (const row of links) {
    if (placed.has(row.link_key)) continue;
    if (q && !matchesSearch(row, q)) continue;
    const parent = groups.find((g) => g.link_key === row.parent_key);
    result.push({
      row,
      level: "child",
      parentLabel: parent?.label ?? row.parent_key ?? "Unknown group",
    });
  }

  return result;
}
