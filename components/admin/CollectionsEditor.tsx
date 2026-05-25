"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  slugifyCollectionName,
  type CollectionAdminRow,
} from "@/lib/collectionsAdmin";
import type { AdminStoreOption } from "@/lib/storesAdmin";

interface CollectionsEditorProps {
  initialRows: CollectionAdminRow[];
  stores: AdminStoreOption[];
}

export function CollectionsEditor({
  initialRows,
  stores,
}: CollectionsEditorProps) {
  const [rows, setRows] = useState(initialRows);
  const [showInactive, setShowInactive] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [storeId, setStoreId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => (showInactive ? rows : rows.filter((r) => r.is_active)),
    [rows, showInactive],
  );

  async function createCollection() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/collections", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        slug: slug.trim() || slugifyCollectionName(name),
        description: description.trim() || null,
        store_id: storeId || null,
        sort_order: sortOrder,
        is_active: true,
      }),
    });
    const data = (await res.json()) as {
      row?: CollectionAdminRow;
      error?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    if (data.row) {
      setRows((prev) =>
        [...prev, data.row!].sort((a, b) => a.sort_order - b.sort_order),
      );
      setCreating(false);
      setName("");
      setSlug("");
      setDescription("");
      setStoreId("");
    }
  }

  async function deactivate(id: string) {
    if (!confirm("Deactivate this collection?")) return;
    setBusy(true);
    const res = await fetch(`/api/admin/collections?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = (await res.json()) as {
      row?: CollectionAdminRow;
      error?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Deactivate failed");
      return;
    }
    if (data.row) {
      setRows((prev) => prev.map((r) => (r.id === data.row!.id ? data.row! : r)));
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
          onClick={() => setCreating(true)}
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
        >
          New collection
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {creating ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-5 space-y-3">
          <h3 className="text-sm font-semibold">New collection</h3>
          <input
            placeholder="Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug) setSlug(slugifyCollectionName(e.target.value));
            }}
            className="w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          />
          <input
            placeholder="Slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 font-mono text-sm"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            rows={2}
          />
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          >
            <option value="">Store (optional)…</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Sort order"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || !name.trim()}
              onClick={() => void createCollection()}
              className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-md px-4 py-2 text-sm text-[var(--muted)]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          No collections yet. Create one to power homepage section rails and CMS
          collection blocks.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          {filtered.map((row) => (
            <li
              key={row.id}
              className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${
                row.is_active ? "" : "opacity-75"
              }`}
            >
              <div>
                <Link
                  href={`/admin/collections/${row.id}`}
                  className="font-medium hover:underline"
                >
                  {row.name}
                </Link>
                <p className="mt-1 font-mono text-xs text-[var(--muted)]">
                  /{row.slug}
                  {row.store_name ? ` · ${row.store_name}` : ""}
                  {row.rule_count > 0 ? ` · ${row.rule_count} rules` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                {!row.is_active ? (
                  <span className="text-xs text-[var(--muted)]">Inactive</span>
                ) : null}
                <Link
                  href={`/admin/collections/${row.id}`}
                  className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold"
                >
                  Edit
                </Link>
                {row.is_active ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void deactivate(row.id)}
                    className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs text-[var(--muted)]"
                  >
                    Deactivate
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
