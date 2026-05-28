"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type {
  PortalManagedLinkRow,
  PortalManagedLinkUpdateInput,
} from "@/lib/managedLinksAdmin";
import type { ManagedLinkMenuLocation } from "@/lib/managedLinksTypes";
import { PORTAL_CTA_FALLBACKS, PORTAL_CTA_KEYS } from "@/lib/portalCtaFallbacks";
import type { PortalCtaKey } from "@/lib/portalCtaTypes";
import { btnPrimarySm, btnSecondarySm } from "@/lib/buttonClasses";
import {
  buildFooterNavDisplayItems,
  buildHeaderNavDisplayItems,
  type NavDisplayItem,
  type NavDisplayLevel,
} from "@/lib/navHierarchyDisplay";

type Tab = "header" | "footer" | "cta";

interface PortalNavigationEditorProps {
  initialRows: PortalManagedLinkRow[];
}

const URL_HINT =
  "/path, #section-id, /#section from other pages, action:general-shortlist, or https://…";

const INPUT_CLASS =
  "w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]";

function navRowsFor(
  rows: PortalManagedLinkRow[],
  location: ManagedLinkMenuLocation,
): PortalManagedLinkRow[] {
  return rows
    .filter((r) => r.link_type === "nav" && r.menu_location === location)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function ctaRows(rows: PortalManagedLinkRow[]): PortalManagedLinkRow[] {
  return rows
    .filter((r) => r.link_type === "cta")
    .sort((a, b) => a.sort_order - b.sort_order);
}

function suggestLinkKey(prefix: string, label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return `${prefix}-${slug || "item"}-${Date.now().toString(36).slice(-4)}`;
}

export function PortalNavigationEditor({ initialRows }: PortalNavigationEditorProps) {
  const [rows, setRows] = useState(initialRows);
  const [tab, setTab] = useState<Tab>("header");
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const headerNav = useMemo(() => navRowsFor(rows, "header"), [rows]);
  const footerNav = useMemo(() => navRowsFor(rows, "footer"), [rows]);
  const ctas = useMemo(() => ctaRows(rows), [rows]);

  const patchRow = useCallback(async (linkKey: string, updates: PortalManagedLinkUpdateInput) => {
    setBusyKey(linkKey);
    setError(null);
    const res = await fetch("/api/admin/managed-links", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link_key: linkKey.trim(), updates }),
    });
    const data = (await res.json()) as { row?: PortalManagedLinkRow; error?: string };
    setBusyKey(null);
    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return false;
    }
    if (data.row) {
      setRows((prev) => prev.map((r) => (r.link_key === linkKey ? data.row! : r)));
    }
    return true;
  }, []);

  const reorder = useCallback(async (linkKey: string, direction: "up" | "down") => {
    setBusyKey(linkKey);
    setError(null);
    const res = await fetch("/api/admin/managed-links/reorder", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ link_key: linkKey, direction }),
    });
    const data = (await res.json()) as { rows?: PortalManagedLinkRow[]; error?: string };
    setBusyKey(null);
    if (!res.ok) {
      setError(data.error ?? "Reorder failed");
      return;
    }
    if (data.rows) setRows(data.rows);
  }, []);

  const removeRow = useCallback(async (linkKey: string) => {
    if (!confirm(`Delete "${linkKey}"? Child links may lose their parent.`)) return;
    setBusyKey(linkKey);
    setError(null);
    const res = await fetch(
      `/api/admin/managed-links?link_key=${encodeURIComponent(linkKey)}`,
      { method: "DELETE", credentials: "include" },
    );
    const data = (await res.json()) as { error?: string };
    setBusyKey(null);
    if (!res.ok) {
      setError(data.error ?? "Delete failed");
      return;
    }
    setRows((prev) => prev.filter((r) => r.link_key !== linkKey));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-[var(--line)] pb-1">
        {(
          [
            ["header", `Header (${headerNav.filter((r) => !r.is_group && !r.parent_key).length} links)`],
            ["footer", `Footer (${footerNav.filter((r) => r.is_group).length} groups)`],
            ["cta", `Portal CTAs (${PORTAL_CTA_KEYS.length} keys)`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`border-b-2 px-3 py-2 text-sm font-semibold transition ${
              tab === id
                ? "border-[var(--ink)] text-[var(--ink)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search labels, keys, URLs…"
          className="min-w-[200px] flex-1 rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
        />
        <Link href="/" target="_blank" rel="noreferrer" className={`${btnSecondarySm} no-underline`}>
          Preview site
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-[var(--muted)]">
        Changes save to{" "}
        <code className="rounded bg-[var(--cream)] px-1 py-0.5">portal_managed_links</code>. The
        public header, footer, and CTA labels refresh after save (reload the storefront if needed).
        Use the <strong className="font-semibold text-[var(--ink)]">Parent</strong> column to move
        existing links into header dropdowns or footer groups without recreating them. Reorder
        still applies within the same parent (top level vs each dropdown/group). URL formats:{" "}
        {URL_HINT}
      </p>

      {tab === "header" ? (
        <HeaderNavPanel
          rows={headerNav}
          search={search}
          busyKey={busyKey}
          onPatch={patchRow}
          onReorder={reorder}
          onDelete={removeRow}
          onCreated={(row) => setRows((prev) => [...prev, row])}
          setError={setError}
          setBusyKey={setBusyKey}
        />
      ) : null}

      {tab === "footer" ? (
        <FooterNavPanel
          rows={footerNav}
          search={search}
          busyKey={busyKey}
          onPatch={patchRow}
          onReorder={reorder}
          onDelete={removeRow}
          onCreated={(row) => setRows((prev) => [...prev, row])}
          setError={setError}
          setBusyKey={setBusyKey}
        />
      ) : null}

      {tab === "cta" ? (
        <CtaPanel
          rows={ctas}
          search={search}
          busyKey={busyKey}
          onPatch={patchRow}
          onReorder={reorder}
          setError={setError}
          setBusyKey={setBusyKey}
          onCreated={(row) => setRows((prev) => [...prev, row])}
        />
      ) : null}
    </div>
  );
}

function matchesSearch(row: PortalManagedLinkRow, q: string): boolean {
  if (!q) return true;
  const hay = [row.link_key, row.label, row.label_es ?? "", row.url ?? ""].join(" ").toLowerCase();
  return hay.includes(q);
}

function HeaderNavPanel({
  rows,
  search,
  busyKey,
  onPatch,
  onReorder,
  onDelete,
  onCreated,
  setError,
  setBusyKey,
}: {
  rows: PortalManagedLinkRow[];
  search: string;
  busyKey: string | null;
  onPatch: (key: string, updates: PortalManagedLinkUpdateInput) => Promise<boolean>;
  onReorder: (key: string, dir: "up" | "down") => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  onCreated: (row: PortalManagedLinkRow) => void;
  setError: (msg: string | null) => void;
  setBusyKey: (key: string | null) => void;
}) {
  const roots = rows.filter((r) => !r.is_group && !r.parent_key);
  const headerDisplayItems = useMemo(
    () => buildHeaderNavDisplayItems(rows, search, matchesSearch),
    [rows, search],
  );

  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newParent, setNewParent] = useState("");

  async function addLink() {
    const label = newLabel.trim();
    if (!label) {
      setError("Label is required");
      return;
    }
    setBusyKey("new");
    setError(null);
    const link_key = suggestLinkKey("nav-header", label);
    const siblings = rows.filter(
      (r) => (r.parent_key ?? "") === (newParent || "") && !r.is_group,
    );
    const res = await fetch("/api/admin/managed-links", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_key,
        link_type: "nav",
        menu_location: "header",
        parent_key: newParent || null,
        label,
        url: newUrl.trim() || null,
        sort_order: siblings.length + 1,
      }),
    });
    const data = (await res.json()) as { row?: PortalManagedLinkRow; error?: string };
    setBusyKey(null);
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    if (data.row) {
      onCreated(data.row);
      setNewLabel("");
      setNewUrl("");
      setNewParent("");
    }
  }

  const childCountByKey = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of rows) {
      if (!item.parent_key || item.is_group) continue;
      map.set(item.parent_key, (map.get(item.parent_key) ?? 0) + 1);
    }
    return map;
  }, [rows]);

  const headerParentOptions = roots.map((p) => ({
    value: p.link_key,
    label: p.label,
  }));

  function parentConfigFor(row: PortalManagedLinkRow) {
    const hasChildren = (childCountByKey.get(row.link_key) ?? 0) > 0;
    const options = headerParentOptions.filter((o) => o.value !== row.link_key);
    return {
      options,
      disabled: hasChildren,
      disabledReason:
        "Has dropdown children — reassign or remove children before nesting under another link.",
    };
  }

  const parentOptions = roots;

  return (
    <div className="space-y-6">
      <NavHierarchyLegend variant="header" />
      <NavItemTable
        title="Header navigation"
        displayItems={headerDisplayItems}
        busyKey={busyKey}
        onPatch={onPatch}
        onReorder={onReorder}
        onDelete={onDelete}
        parentConfig={parentConfigFor}
      />

      <section className="rounded-xl border border-dashed border-[var(--line-dark)] bg-[var(--cream)]/50 p-4">
        <h3 className="text-sm font-semibold text-[var(--ink)]">Add header link</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Label">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Inventory"
            />
          </Field>
          <Field label="URL">
            <input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className={INPUT_CLASS}
              placeholder="/inventory"
            />
          </Field>
          <Field label="Parent (dropdown)">
            <select
              value={newParent}
              onChange={(e) => setNewParent(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Top level</option>
              {parentOptions.map((p) => (
                <option key={p.link_key} value={p.link_key}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              disabled={busyKey === "new"}
              onClick={() => void addLink()}
              className={btnPrimarySm}
            >
              Add link
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FooterNavPanel({
  rows,
  search,
  busyKey,
  onPatch,
  onReorder,
  onDelete,
  onCreated,
  setError,
  setBusyKey,
}: {
  rows: PortalManagedLinkRow[];
  search: string;
  busyKey: string | null;
  onPatch: (key: string, updates: PortalManagedLinkUpdateInput) => Promise<boolean>;
  onReorder: (key: string, dir: "up" | "down") => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  onCreated: (row: PortalManagedLinkRow) => void;
  setError: (msg: string | null) => void;
  setBusyKey: (key: string | null) => void;
}) {
  const groups = rows.filter((r) => r.is_group);
  const footerDisplayItems = useMemo(
    () => buildFooterNavDisplayItems(rows, search, matchesSearch),
    [rows, search],
  );

  const footerParentOptions = groups.map((g) => ({
    value: g.link_key,
    label: g.label,
  }));

  function footerParentConfigFor(row: PortalManagedLinkRow) {
    return {
      options: footerParentOptions.filter((o) => o.value !== row.link_key),
      disabled: false,
    };
  }

  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newParent, setNewParent] = useState(groups[0]?.link_key ?? "");

  async function addGroup() {
    const label = newGroupTitle.trim();
    if (!label) {
      setError("Group title is required");
      return;
    }
    setBusyKey("new-group");
    setError(null);
    const link_key = suggestLinkKey("nav-footer-group", label);
    const res = await fetch("/api/admin/managed-links", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_key,
        link_type: "nav",
        menu_location: "footer",
        is_group: true,
        label,
        sort_order: groups.length + 1,
      }),
    });
    const data = (await res.json()) as { row?: PortalManagedLinkRow; error?: string };
    setBusyKey(null);
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    if (data.row) {
      onCreated(data.row);
      setNewGroupTitle("");
      setNewParent(data.row.link_key);
    }
  }

  async function addLink() {
    const label = newLabel.trim();
    const parent = newParent.trim();
    if (!label || !parent) {
      setError("Label and footer group are required");
      return;
    }
    setBusyKey("new");
    setError(null);
    const link_key = suggestLinkKey("nav-footer", label);
    const siblings = rows.filter((r) => r.parent_key === parent);
    const res = await fetch("/api/admin/managed-links", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_key,
        link_type: "nav",
        menu_location: "footer",
        parent_key: parent,
        label,
        url: newUrl.trim() || null,
        sort_order: siblings.length + 1,
      }),
    });
    const data = (await res.json()) as { row?: PortalManagedLinkRow; error?: string };
    setBusyKey(null);
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    if (data.row) {
      onCreated(data.row);
      setNewLabel("");
      setNewUrl("");
    }
  }

  return (
    <div className="space-y-6">
      <NavHierarchyLegend variant="footer" />
      <NavItemTable
        title="Footer navigation"
        displayItems={footerDisplayItems}
        busyKey={busyKey}
        onPatch={onPatch}
        onReorder={onReorder}
        onDelete={onDelete}
        parentConfig={footerParentConfigFor}
        parentRequired
        hideUrlForGroup
      />

      <section className="rounded-xl border border-dashed border-[var(--line-dark)] bg-[var(--cream)]/50 p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--ink)]">Add footer group</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={newGroupTitle}
              onChange={(e) => setNewGroupTitle(e.target.value)}
              className={`${INPUT_CLASS} min-w-[200px] flex-1`}
              placeholder="Column title (e.g. Shop)"
            />
            <button
              type="button"
              disabled={busyKey === "new-group"}
              onClick={() => void addGroup()}
              className={btnSecondarySm}
            >
              Add group
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[var(--ink)]">Add footer link</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Group">
              <select
                value={newParent}
                onChange={(e) => setNewParent(e.target.value)}
                className={INPUT_CLASS}
              >
                {groups.map((g) => (
                  <option key={g.link_key} value={g.link_key}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Label">
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <Field label="URL">
              <input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
            <div className="flex items-end">
              <button
                type="button"
                disabled={busyKey === "new" || groups.length === 0}
                onClick={() => void addLink()}
                className={btnPrimarySm}
              >
                Add link
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CtaPanel({
  rows,
  search,
  busyKey,
  onPatch,
  onReorder,
  setError,
  setBusyKey,
  onCreated,
}: {
  rows: PortalManagedLinkRow[];
  search: string;
  busyKey: string | null;
  onPatch: (key: string, updates: PortalManagedLinkUpdateInput) => Promise<boolean>;
  onReorder: (key: string, dir: "up" | "down") => Promise<void>;
  setError: (msg: string | null) => void;
  setBusyKey: (key: string | null) => void;
  onCreated: (row: PortalManagedLinkRow) => void;
}) {
  const q = search.trim().toLowerCase();
  const byKey = useMemo(() => new Map(rows.map((r) => [r.link_key, r])), [rows]);

  async function seedCta(key: PortalCtaKey) {
    const fb = PORTAL_CTA_FALLBACKS[key];
    setBusyKey(key);
    setError(null);
    const res = await fetch("/api/admin/managed-links", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        link_key: key,
        link_type: "cta",
        label: fb.label,
        label_es: fb.labelEs,
        url: fb.url,
        sort_order: PORTAL_CTA_KEYS.indexOf(key) + 1,
      }),
    });
    const data = (await res.json()) as { row?: PortalManagedLinkRow; error?: string };
    setBusyKey(null);
    if (!res.ok) {
      setError(data.error ?? "Seed failed");
      return;
    }
    if (data.row) onCreated(data.row);
  }

  const visibleKeys = PORTAL_CTA_KEYS.filter((key) => {
    const row = byKey.get(key);
    const fb = PORTAL_CTA_FALLBACKS[key];
    if (!q) return true;
    const hay = [key, row?.label ?? fb.label, row?.label_es ?? fb.labelEs ?? "", row?.url ?? fb.url ?? ""]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-[var(--line)] bg-[var(--cream)] text-xs uppercase tracking-wide text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2 w-28">Order</th>
            <th className="px-3 py-2">Key</th>
            <th className="px-3 py-2">English label</th>
            <th className="px-3 py-2">Spanish label</th>
            <th className="px-3 py-2">URL</th>
            <th className="px-3 py-2 w-24">Active</th>
            <th className="px-3 py-2 w-28" />
          </tr>
        </thead>
        <tbody>
          {visibleKeys.map((key) => {
            const row = byKey.get(key);
            const fb = PORTAL_CTA_FALLBACKS[key];
            if (!row) {
              return (
                <tr key={key} className="border-b border-[var(--line)] bg-amber-50/40">
                  <td className="px-3 py-2 text-[var(--muted)]">—</td>
                  <td className="px-3 py-2 font-mono text-xs">{key}</td>
                  <td className="px-3 py-2" colSpan={3}>
                    <span className="text-[var(--muted)]">
                      Using code fallback: {fb.label}
                      {fb.url ? ` → ${fb.url}` : " (modal/action)"}
                    </span>
                  </td>
                  <td className="px-3 py-2">—</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={busyKey === key}
                      onClick={() => void seedCta(key)}
                      className={btnSecondarySm}
                    >
                      Add to DB
                    </button>
                  </td>
                </tr>
              );
            }
            return (
              <CtaEditableRow
                key={row.link_key}
                row={row}
                busyKey={busyKey}
                onPatch={onPatch}
                onReorder={onReorder}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type NavParentConfig = {
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  disabledReason?: string;
};

const NAV_LEVEL_STYLES: Record<
  NavDisplayLevel,
  { row: string; badge: string; label: string }
> = {
  top: {
    row: "bg-white",
    badge: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
    label: "Top level",
  },
  child: {
    row: "bg-amber-50/80 border-l-4 border-l-[var(--gold)]",
    badge: "bg-amber-100 text-amber-950 ring-1 ring-amber-200/80",
    label: "Child link",
  },
  group: {
    row: "bg-[var(--cream)] border-t-2 border-t-[var(--gold)]/50",
    badge: "bg-violet-100 text-violet-950 ring-1 ring-violet-200",
    label: "Column group",
  },
};

function NavHierarchyLegend({ variant }: { variant: "header" | "footer" }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-xs">
      <span className="font-semibold text-[var(--muted)]">Legend:</span>
      {variant === "header" ? (
        <>
          <NavLevelBadge level="top" />
          <span className="text-[var(--muted)]">Main nav / dropdown parent</span>
          <NavLevelBadge level="child" />
          <span className="text-[var(--muted)]">Nested under the row above</span>
        </>
      ) : (
        <>
          <NavLevelBadge level="group" />
          <span className="text-[var(--muted)]">Footer column heading</span>
          <NavLevelBadge level="child" />
          <span className="text-[var(--muted)]">Link in that column</span>
        </>
      )}
    </div>
  );
}

function NavLevelBadge({ level }: { level: NavDisplayLevel }) {
  const style = NAV_LEVEL_STYLES[level];
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
    >
      {style.label}
    </span>
  );
}

function NavItemTable({
  title,
  displayItems,
  busyKey,
  onPatch,
  onReorder,
  onDelete,
  hideUrl,
  hideUrlForGroup,
  parentConfig,
  parentRequired,
}: {
  title: string;
  displayItems: NavDisplayItem[];
  busyKey: string | null;
  onPatch: (key: string, updates: PortalManagedLinkUpdateInput) => Promise<boolean>;
  onReorder: (key: string, dir: "up" | "down") => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  hideUrl?: boolean;
  hideUrlForGroup?: boolean;
  parentConfig?: (row: PortalManagedLinkRow) => NavParentConfig;
  parentRequired?: boolean;
}) {
  if (displayItems.length === 0) return null;

  const showParentColumn = Boolean(parentConfig);

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
      <h3 className="border-b border-[var(--line)] bg-[var(--cream)] px-3 py-2 text-sm font-semibold text-[var(--ink)]">
        {title}
      </h3>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-[var(--line)] bg-[var(--cream)]/60 text-xs uppercase tracking-wide text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2 w-24">Level</th>
            <th className="px-3 py-2 w-28">Order</th>
            <th className="px-3 py-2">Label</th>
            {showParentColumn ? <th className="px-3 py-2 min-w-[140px]">Parent</th> : null}
            {!hideUrl ? <th className="px-3 py-2">URL / action</th> : null}
            <th className="px-3 py-2">Spanish</th>
            <th className="px-3 py-2 w-20">New tab</th>
            <th className="px-3 py-2 w-24">Active</th>
            <th className="px-3 py-2 w-28" />
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, index) => {
            const prev = displayItems[index - 1];
            const showGroupGap =
              item.level === "group" && prev && prev.level !== "group";
            return (
              <EditableNavRow
                key={item.row.link_key}
                row={item.row}
                displayLevel={item.level}
                parentLabel={item.parentLabel}
                showGroupGap={showGroupGap}
                busyKey={busyKey}
                onPatch={onPatch}
                onReorder={onReorder}
                onDelete={onDelete}
                hideUrl={hideUrl || (hideUrlForGroup && item.level === "group")}
                parentConfig={
                  item.level === "group" ? undefined : parentConfig?.(item.row)
                }
                parentRequired={parentRequired && item.level === "child"}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EditableNavRow({
  row,
  displayLevel = "top",
  parentLabel,
  showGroupGap,
  busyKey,
  onPatch,
  onReorder,
  onDelete,
  hideUrl,
  hideDelete,
  parentConfig,
  parentRequired,
}: {
  row: PortalManagedLinkRow;
  displayLevel?: NavDisplayLevel;
  parentLabel?: string;
  showGroupGap?: boolean;
  busyKey: string | null;
  onPatch: (key: string, updates: PortalManagedLinkUpdateInput) => Promise<boolean>;
  onReorder: (key: string, dir: "up" | "down") => Promise<void>;
  onDelete: (key: string) => Promise<void>;
  hideUrl?: boolean;
  hideDelete?: boolean;
  parentConfig?: NavParentConfig;
  parentRequired?: boolean;
}) {
  const [label, setLabel] = useState(row.label);
  const [labelEs, setLabelEs] = useState(row.label_es ?? "");
  const [url, setUrl] = useState(row.url ?? "");
  const [parentKey, setParentKey] = useState(row.parent_key ?? "");
  const [active, setActive] = useState(row.is_active !== false);
  const [newTab, setNewTab] = useState(row.opens_new_tab === true);
  const isBusy = busyKey === row.link_key;

  const savedParent = row.parent_key ?? "";
  const dirty =
    label !== row.label ||
    labelEs !== (row.label_es ?? "") ||
    url !== (row.url ?? "") ||
    parentKey !== savedParent ||
    active !== (row.is_active !== false) ||
    newTab !== (row.opens_new_tab === true);

  async function save() {
    await onPatch(row.link_key, {
      label,
      label_es: labelEs || null,
      url: hideUrl ? row.url : url || null,
      parent_key: parentConfig ? parentKey || null : undefined,
      is_active: active,
      opens_new_tab: newTab,
    });
  }

  const levelStyle = NAV_LEVEL_STYLES[displayLevel];
  const isChild = displayLevel === "child";

  return (
    <tr
      className={`border-b border-[var(--line)] align-top ${levelStyle.row} ${
        showGroupGap ? "border-t-4 border-t-[var(--line-dark)]" : ""
      }`}
    >
      <td className="px-3 py-2 align-middle">
        <NavLevelBadge level={displayLevel} />
        {isChild && parentLabel ? (
          <p className="mt-1 max-w-[5.5rem] text-[10px] leading-snug text-[var(--muted)]">
            under {parentLabel}
          </p>
        ) : null}
      </td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void onReorder(row.link_key, "up")}
            className="rounded border border-[var(--line)] px-1.5 py-0.5 text-xs hover:bg-[var(--cream)]"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void onReorder(row.link_key, "down")}
            className="rounded border border-[var(--line)] px-1.5 py-0.5 text-xs hover:bg-[var(--cream)]"
            aria-label="Move down"
          >
            ↓
          </button>
        </div>
        <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">{row.link_key}</p>
      </td>
      <td className={`px-3 py-2 ${isChild ? "pl-4" : ""}`}>
        <div className={`flex items-start gap-1 ${isChild ? "pl-2" : ""}`}>
          {isChild ? (
            <span className="mt-2.5 shrink-0 text-sm text-[var(--gold)]" aria-hidden>
              └
            </span>
          ) : null}
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className={`${INPUT_CLASS} min-w-[120px] flex-1`}
          />
        </div>
      </td>
      {parentConfig ? (
        <td className="px-3 py-2">
          <select
            value={parentKey}
            onChange={(e) => setParentKey(e.target.value)}
            disabled={parentConfig.disabled}
            className={`${INPUT_CLASS} min-w-[130px]`}
            title={parentConfig.disabled ? parentConfig.disabledReason : undefined}
          >
            {!parentRequired ? <option value="">Top level</option> : null}
            {parentConfig.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {parentConfig.disabled && parentConfig.disabledReason ? (
            <p className="mt-1 text-[10px] text-amber-800">{parentConfig.disabledReason}</p>
          ) : null}
        </td>
      ) : null}
      {!hideUrl ? (
        <td className="px-3 py-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={`${INPUT_CLASS} min-w-[160px]`}
            placeholder={URL_HINT}
          />
        </td>
      ) : null}
      <td className="px-3 py-2">
        <input
          value={labelEs}
          onChange={(e) => setLabelEs(e.target.value)}
          className={`${INPUT_CLASS} min-w-[100px]`}
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={newTab}
          onChange={(e) => setNewTab(e.target.checked)}
          aria-label="Open in new tab"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          aria-label="Active on site"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-col gap-1">
          {dirty ? (
            <button type="button" disabled={isBusy} onClick={() => void save()} className={btnPrimarySm}>
              Save
            </button>
          ) : null}
          {!hideDelete ? (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => void onDelete(row.link_key)}
              className="text-xs text-red-700 hover:underline"
            >
              Delete
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

function CtaEditableRow({
  row,
  busyKey,
  onPatch,
  onReorder,
}: {
  row: PortalManagedLinkRow;
  busyKey: string | null;
  onPatch: (key: string, updates: PortalManagedLinkUpdateInput) => Promise<boolean>;
  onReorder: (key: string, dir: "up" | "down") => Promise<void>;
}) {
  const [label, setLabel] = useState(row.label);
  const [labelEs, setLabelEs] = useState(row.label_es ?? "");
  const [url, setUrl] = useState(row.url ?? "");
  const [active, setActive] = useState(row.is_active !== false);
  const isBusy = busyKey === row.link_key;
  const dirty =
    label !== row.label ||
    labelEs !== (row.label_es ?? "") ||
    url !== (row.url ?? "") ||
    active !== (row.is_active !== false);

  return (
    <tr className="border-b border-[var(--line)] align-top">
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void onReorder(row.link_key, "up")}
            className="rounded border border-[var(--line)] px-1.5 py-0.5 text-xs"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void onReorder(row.link_key, "down")}
            className="rounded border border-[var(--line)] px-1.5 py-0.5 text-xs"
          >
            ↓
          </button>
        </div>
      </td>
      <td className="px-3 py-2 font-mono text-xs">{row.link_key}</td>
      <td className="px-3 py-2">
        <input value={label} onChange={(e) => setLabel(e.target.value)} className={INPUT_CLASS} />
      </td>
      <td className="px-3 py-2">
        <input value={labelEs} onChange={(e) => setLabelEs(e.target.value)} className={INPUT_CLASS} />
      </td>
      <td className="px-3 py-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={INPUT_CLASS}
          placeholder="Leave empty for modal actions"
        />
      </td>
      <td className="px-3 py-2">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          aria-label="Active"
        />
      </td>
      <td className="px-3 py-2">
        {dirty ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              void onPatch(row.link_key, {
                label,
                label_es: labelEs || null,
                url: url || null,
                is_active: active,
              })
            }
            className={btnPrimarySm}
          >
            Save
          </button>
        ) : null}
      </td>
    </tr>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold text-[var(--muted)]">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}
