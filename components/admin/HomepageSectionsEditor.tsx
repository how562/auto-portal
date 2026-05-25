"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HomepageSectionAdminRow } from "@/lib/homepageSectionsAdmin";
interface CollectionOption {
  id: string;
  name: string;
}

interface HomepageSectionsEditorProps {
  initialRows: HomepageSectionAdminRow[];
  collections: CollectionOption[];
}

export function HomepageSectionsEditor({
  initialRows,
  collections,
}: HomepageSectionsEditorProps) {
  const [rows, setRows] = useState(initialRows);
  const [showInactive, setShowInactive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    return showInactive ? rows : rows.filter((r) => r.is_active);
  }, [rows, showInactive]);

  async function toggleActive(row: HomepageSectionAdminRow) {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/homepage-sections", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: row.id,
        updates: { is_active: !row.is_active },
      }),
    });
    const data = (await res.json()) as {
      row?: HomepageSectionAdminRow;
      error?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Update failed");
      return;
    }
    if (data.row) {
      setRows((prev) => prev.map((r) => (r.id === data.row!.id ? data.row! : r)));
    }
  }

  async function moveOrder(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= filtered.length) return;
    const a = filtered[index];
    const b = filtered[target];
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/homepage-sections", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "swap_order", swapA: a.id, swapB: b.id }),
    });
    const data = (await res.json()) as {
      rows?: HomepageSectionAdminRow[];
      error?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Reorder failed");
      return;
    }
    if (data.rows) setRows(data.rows);
  }

  async function addSection() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/homepage-sections", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New section",
        section_type: "collection",
        is_active: false,
      }),
    });
    const data = (await res.json()) as {
      row?: HomepageSectionAdminRow;
      error?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    if (data.row) {
      setRows((prev) => [...prev, data.row!].sort((x, y) => x.sort_order - y.sort_order));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive
        </label>
        <button
          type="button"
          onClick={() => void addSection()}
          disabled={busy}
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Add section
        </button>
      </div>

      {collections.length === 0 ? (
        <p className="text-xs text-amber-800">
          No collections yet — create one under{" "}
          <Link href="/admin/collections" className="underline">
            Collections
          </Link>{" "}
          before wiring collection sections.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          No homepage sections yet. Add a section to configure rails when the
          homepage layout uses <code>homepage_sections</code>.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          {filtered.map((row, index) => (
            <li
              key={row.id}
              className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${
                row.is_active ? "" : "bg-[var(--cream)]/60"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {row.title || <span className="text-[var(--muted)]">Untitled</span>}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {row.section_type}
                  {row.collection_name ? ` · ${row.collection_name}` : ""}
                  {" · order "}
                  {row.sort_order}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => void moveOrder(index, -1)}
                  className="rounded border border-[var(--line-dark)] px-2 py-1 text-xs disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy || index === filtered.length - 1}
                  onClick={() => void moveOrder(index, 1)}
                  className="rounded border border-[var(--line-dark)] px-2 py-1 text-xs disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void toggleActive(row)}
                  className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold"
                >
                  {row.is_active ? "Hide" : "Show"}
                </button>
                <Link
                  href={`/admin/homepage-sections/${row.id}`}
                  className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--cream-dark)]"
                >
                  Edit
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
