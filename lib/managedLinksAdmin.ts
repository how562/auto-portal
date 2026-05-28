import type { ManagedLinkRow } from "./managedLinksTypes";
import { getSupabaseAdmin } from "./supabaseAdmin";

function isMissingTableError(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    msg.includes("Could not find the table") ||
    msg.includes("schema cache")
  );
}

export const PORTAL_MANAGED_LINKS_MIGRATION_HINT =
  "Run the migration: supabase/migrations/20260523160000_portal_managed_links.sql (Supabase Dashboard → SQL, or `npx supabase db push`).";

const LINK_SELECT =
  "link_key, link_type, menu_location, parent_key, is_group, label, label_es, url, sort_order, opens_new_tab, is_active, created_at, updated_at";

export interface PortalManagedLinkRow extends ManagedLinkRow {
  created_at: string;
  updated_at: string;
}

export type PortalManagedLinkUpdateInput = Partial<
  Pick<
    ManagedLinkRow,
    | "menu_location"
    | "parent_key"
    | "is_group"
    | "label"
    | "label_es"
    | "url"
    | "sort_order"
    | "opens_new_tab"
    | "is_active"
  >
>;

export interface PortalManagedLinkCreateInput {
  link_key: string;
  link_type: "nav" | "cta";
  menu_location?: "header" | "footer" | null;
  parent_key?: string | null;
  is_group?: boolean;
  label: string;
  label_es?: string | null;
  url?: string | null;
  sort_order?: number;
  opens_new_tab?: boolean;
  is_active?: boolean;
}

function normalizeRow(row: Record<string, unknown>): PortalManagedLinkRow | null {
  const linkKey = typeof row.link_key === "string" ? row.link_key.trim() : "";
  const linkType = row.link_type === "nav" || row.link_type === "cta" ? row.link_type : null;
  const label = typeof row.label === "string" ? row.label.trim() : "";
  if (!linkKey || !linkType || !label) return null;

  return {
    link_key: linkKey,
    link_type: linkType,
    menu_location:
      row.menu_location === "header" || row.menu_location === "footer"
        ? row.menu_location
        : null,
    parent_key:
      typeof row.parent_key === "string" ? row.parent_key.trim() || null : null,
    is_group: row.is_group === true,
    label,
    label_es: typeof row.label_es === "string" ? row.label_es.trim() || null : null,
    url: typeof row.url === "string" ? row.url.trim() || null : null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    opens_new_tab: row.opens_new_tab === true,
    is_active: row.is_active !== false,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function validateNavRow(input: {
  menu_location?: "header" | "footer" | null;
  is_group?: boolean;
  parent_key?: string | null;
  url?: string | null;
}) {
  if (!input.menu_location) {
    throw new Error("Navigation links require menu_location (header or footer)");
  }
  if (input.is_group && input.parent_key) {
    throw new Error("Footer groups cannot have a parent");
  }
  if (input.is_group && input.url) {
    throw new Error("Group rows should not have a URL");
  }
}

function validateNavParentAssignment(
  linkKey: string,
  row: Pick<ManagedLinkRow, "link_type" | "menu_location" | "is_group" | "parent_key">,
  parentKey: string | null,
  allRows: PortalManagedLinkRow[],
): void {
  if (row.link_type !== "nav") return;

  const normalizedParent = parentKey?.trim() || null;
  if (!normalizedParent) return;

  if (normalizedParent === linkKey) {
    throw new Error("A link cannot be its own parent");
  }

  const hasChildren = allRows.some(
    (r) => r.parent_key === linkKey && !r.is_group,
  );
  if (hasChildren) {
    throw new Error(
      "This link has dropdown children. Move or remove them before nesting this item under another parent.",
    );
  }

  if (row.is_group) {
    throw new Error("Footer column groups cannot be placed under another parent");
  }

  const parent = allRows.find((r) => r.link_key === normalizedParent);
  if (!parent) {
    throw new Error("Selected parent link was not found. Refresh and try again.");
  }
  if (parent.link_type !== "nav" || parent.menu_location !== row.menu_location) {
    throw new Error("Parent must be in the same menu (header or footer)");
  }

  if (row.menu_location === "header") {
    if (parent.is_group || parent.parent_key) {
      throw new Error("Header dropdown parent must be a top-level header link");
    }
  }

  if (row.menu_location === "footer") {
    if (!parent.is_group) {
      throw new Error("Footer links must be placed under a footer column group");
    }
  }

  let walk: string | null = normalizedParent;
  const seen = new Set<string>();
  while (walk) {
    if (walk === linkKey) {
      throw new Error("Invalid parent: would create a circular reference");
    }
    if (seen.has(walk)) break;
    seen.add(walk);
    walk = allRows.find((r) => r.link_key === walk)?.parent_key ?? null;
  }
}

function nextSortOrderAmongSiblings(
  allRows: PortalManagedLinkRow[],
  row: Pick<ManagedLinkRow, "link_type" | "menu_location" | "parent_key" | "is_group">,
): number {
  const siblings = allRows.filter((r) => {
    if (r.link_type !== row.link_type) return false;
    if (row.link_type === "cta") return true;
    return (
      r.menu_location === row.menu_location &&
      (r.parent_key ?? null) === (row.parent_key ?? null) &&
      r.is_group === row.is_group
    );
  });
  if (siblings.length === 0) return 1;
  return Math.max(...siblings.map((s) => s.sort_order)) + 1;
}

function validateCtaRow() {
  // CTAs use link_type=cta with null menu_location — enforced by DB check constraint.
}

function isSingleRowCoercionError(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST116" ||
    msg.includes("Cannot coerce the result to a single JSON object") ||
    msg.includes("JSON object requested, multiple")
  );
}

/** Ensures exactly one row exists for the primary key before update/delete. */
async function assertUniqueLinkKey(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  linkKey: string,
): Promise<void> {
  const { data, error } = await supabase
    .from("portal_managed_links")
    .select("link_key")
    .eq("link_key", linkKey);

  if (error) {
    throw new Error(`Failed to look up link "${linkKey}": ${error.message}`);
  }

  const matches = data ?? [];
  if (matches.length === 0) {
    throw new Error(
      `No link found with key "${linkKey}". Refresh the page. For CTAs not in the database yet, use "Add to DB" first.`,
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Duplicate link_key "${linkKey}" (${matches.length} rows). Remove duplicates in Supabase portal_managed_links.`,
    );
  }
}

function formatWriteError(
  action: "create" | "update",
  linkKey: string,
  error: { message?: string; code?: string },
): string {
  if (isSingleRowCoercionError(error)) {
    return action === "update"
      ? `Failed to update link "${linkKey}": no matching row was returned. Refresh and try again, or use "Add to DB" if this CTA is not stored yet.`
      : `Failed to create link "${linkKey}": insert did not return a row.`;
  }
  if (error.code === "23505") {
    return `Link key "${linkKey}" already exists. Use a different key or edit the existing row.`;
  }
  return `Failed to ${action} link: ${error.message ?? "Unknown error"}`;
}

export async function listPortalManagedLinks(): Promise<PortalManagedLinkRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("portal_managed_links")
    .select(LINK_SELECT)
    .order("link_type", { ascending: true })
    .order("menu_location", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) {
      throw new Error(
        `Table portal_managed_links is not in your database yet. ${PORTAL_MANAGED_LINKS_MIGRATION_HINT}`,
      );
    }
    throw new Error(`Failed to load managed links: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => normalizeRow(row as Record<string, unknown>))
    .filter((row): row is PortalManagedLinkRow => row != null);
}

export async function createPortalManagedLink(
  input: PortalManagedLinkCreateInput,
): Promise<PortalManagedLinkRow> {
  const linkKey = input.link_key.trim();
  if (!linkKey) throw new Error("link_key is required");
  const label = input.label.trim();
  if (!label) throw new Error("label is required");

  if (input.link_type === "nav") {
    validateNavRow({
      menu_location: input.menu_location,
      is_group: input.is_group,
      parent_key: input.parent_key,
      url: input.url,
    });
    const existing = await listPortalManagedLinks();
    validateNavParentAssignment(
      linkKey,
      {
        link_type: "nav",
        menu_location: input.menu_location ?? null,
        is_group: input.is_group === true,
        parent_key: input.parent_key ?? null,
      },
      input.parent_key ?? null,
      existing,
    );
  } else {
    validateCtaRow();
  }

  const payload = {
    link_key: linkKey,
    link_type: input.link_type,
    menu_location: input.link_type === "cta" ? null : input.menu_location ?? null,
    parent_key: input.parent_key?.trim() || null,
    is_group: input.is_group === true,
    label,
    label_es: input.label_es?.trim() || null,
    url: input.url?.trim() || null,
    sort_order: input.sort_order ?? 0,
    opens_new_tab: input.opens_new_tab === true,
    is_active: input.is_active !== false,
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("portal_managed_links")
    .insert(payload)
    .select(LINK_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(formatWriteError("create", linkKey, error));
  }

  const normalized = data
    ? normalizeRow(data as Record<string, unknown>)
    : null;
  if (!normalized) {
    throw new Error(
      `Created link "${linkKey}" but the row could not be read back. Refresh the page.`,
    );
  }
  return normalized;
}

export async function updatePortalManagedLink(
  linkKey: string,
  input: PortalManagedLinkUpdateInput,
): Promise<PortalManagedLinkRow> {
  const key = linkKey.trim();
  if (!key) throw new Error("link_key is required");

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.label !== undefined) {
    const label = input.label.trim();
    if (!label) throw new Error("label cannot be empty");
    payload.label = label;
  }
  if (input.label_es !== undefined) {
    payload.label_es = input.label_es?.trim() || null;
  }
  if (input.url !== undefined) {
    payload.url = input.url?.trim() || null;
  }
  if (input.menu_location !== undefined) {
    payload.menu_location = input.menu_location;
  }
  if (input.parent_key !== undefined) {
    payload.parent_key = input.parent_key?.trim() || null;
  }
  if (input.is_group !== undefined) {
    payload.is_group = input.is_group;
  }
  if (input.sort_order !== undefined) {
    payload.sort_order = input.sort_order;
  }
  if (input.opens_new_tab !== undefined) {
    payload.opens_new_tab = input.opens_new_tab;
  }
  if (input.is_active !== undefined) {
    payload.is_active = input.is_active;
  }

  const fieldCount = Object.keys(payload).filter((k) => k !== "updated_at").length;
  if (fieldCount === 0) {
    throw new Error("No fields to update");
  }

  const supabase = getSupabaseAdmin();
  await assertUniqueLinkKey(supabase, key);

  const allRows = await listPortalManagedLinks();
  const current = allRows.find((r) => r.link_key === key);
  if (!current) {
    throw new Error(`No link found with key "${key}". Refresh the page.`);
  }

  if (input.parent_key !== undefined && current.link_type === "nav") {
    const nextParent = input.parent_key?.trim() || null;
    validateNavParentAssignment(
      key,
      {
        link_type: current.link_type,
        menu_location: current.menu_location ?? null,
        is_group: current.is_group === true,
        parent_key: nextParent,
      },
      nextParent,
      allRows,
    );
    if ((current.parent_key ?? null) !== nextParent) {
      payload.sort_order = nextSortOrderAmongSiblings(allRows, {
        link_type: current.link_type,
        menu_location: current.menu_location ?? null,
        parent_key: nextParent,
        is_group: current.is_group === true,
      });
    }
  }

  const { data, error } = await supabase
    .from("portal_managed_links")
    .update(payload)
    .eq("link_key", key)
    .select(LINK_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error(formatWriteError("update", key, error));
  }

  const normalized = data
    ? normalizeRow(data as Record<string, unknown>)
    : null;
  if (!normalized) {
    throw new Error(
      `Update for "${key}" did not return a row. The link may have been deleted — refresh the page.`,
    );
  }
  return normalized;
}

export async function deletePortalManagedLink(linkKey: string): Promise<void> {
  const key = linkKey.trim();
  if (!key) throw new Error("link_key is required");

  const supabase = getSupabaseAdmin();
  await assertUniqueLinkKey(supabase, key);

  const { error, count } = await supabase
    .from("portal_managed_links")
    .delete({ count: "exact" })
    .eq("link_key", key);

  if (error) {
    throw new Error(`Failed to delete link: ${error.message}`);
  }
  if (count === 0) {
    throw new Error(`No link found with key "${key}".`);
  }
}

export async function swapManagedLinkSortOrder(
  linkKey: string,
  direction: "up" | "down",
): Promise<PortalManagedLinkRow[]> {
  const key = linkKey.trim();
  if (!key) throw new Error("link_key is required");

  const rows = await listPortalManagedLinks();
  const current = rows.find((r) => r.link_key === key);
  if (!current) throw new Error("Link not found");

  const siblings = rows
    .filter((row) => {
      if (row.link_type !== current.link_type) return false;
      if (row.link_type === "cta") return true;
      return (
        row.menu_location === current.menu_location &&
        (row.parent_key ?? null) === (current.parent_key ?? null) &&
        row.is_group === current.is_group
      );
    })
    .sort((a, b) => a.sort_order - b.sort_order);

  const index = siblings.findIndex((r) => r.link_key === key);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const other = siblings[swapIndex];
  if (!other) return siblings;

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error: e1 } = await supabase
    .from("portal_managed_links")
    .update({ sort_order: other.sort_order, updated_at: now })
    .eq("link_key", current.link_key);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from("portal_managed_links")
    .update({ sort_order: current.sort_order, updated_at: now })
    .eq("link_key", other.link_key);
  if (e2) throw new Error(e2.message);

  return listPortalManagedLinks();
}
