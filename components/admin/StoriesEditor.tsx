"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  slugifyStoryTitle,
  type StoryAdminRow,
} from "@/lib/storiesAdmin";
import {
  formatStoryDate,
  storyCategoryLabel,
  storyHref,
} from "@/lib/storiesContent";

interface StoriesEditorProps {
  initialRows: StoryAdminRow[];
}

export function StoriesEditor({ initialRows }: StoriesEditorProps) {
  const [rows, setRows] = useState(initialRows);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">(
    "all",
  );
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return rows;
    return rows.filter((r) => r.status === statusFilter);
  }, [rows, statusFilter]);

  async function createStory() {
    if (!title.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/stories", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        slug: slug.trim() || slugifyStoryTitle(title),
        status: "draft",
      }),
    });
    const data = (await res.json()) as {
      row?: StoryAdminRow;
      error?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Create failed");
      return;
    }
    if (data.row) {
      setRows((prev) => [data.row!, ...prev]);
      setCreating(false);
      setTitle("");
      setSlug("");
    }
  }

  async function seedPlaceholders() {
    if (
      !confirm(
        "Import sample stories from site defaults? Existing slugs are skipped.",
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    setSeedMessage(null);
    const res = await fetch("/api/admin/stories", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seedPlaceholders: true }),
    });
    const data = (await res.json()) as {
      inserted?: number;
      skipped?: number;
      error?: string;
    };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Import failed");
      return;
    }
    setSeedMessage(
      `Imported ${data.inserted ?? 0} story/stories (${data.skipped ?? 0} skipped).`,
    );
    const listRes = await fetch("/api/admin/stories", { credentials: "include" });
    const listData = (await listRes.json()) as { rows?: StoryAdminRow[] };
    if (listData.rows) setRows(listData.rows);
  }

  async function remove(id: string, storyTitle: string) {
    if (!confirm(`Delete “${storyTitle}”? This cannot be undone.`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/stories?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Delete failed");
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "published" | "draft")
          }
          className="rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
        >
          New story
        </button>
        <button
          type="button"
          onClick={() => void seedPlaceholders()}
          disabled={busy}
          className="rounded-md border border-[var(--line-dark)] px-4 py-2 text-sm font-medium"
        >
          Import sample stories
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {seedMessage ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          {seedMessage}
        </p>
      ) : null}

      {creating ? (
        <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white p-5">
          <h3 className="text-sm font-semibold">New story</h3>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(slugifyStoryTitle(e.target.value));
            }}
            className="w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          />
          <input
            placeholder="Slug (URL)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 font-mono text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy || !title.trim()}
              onClick={() => void createStory()}
              className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Create draft
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
        <p className="text-sm text-[var(--muted)]">
          No stories yet. Create one or import samples to get started.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--line)] bg-[var(--cream)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Category
                </th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  Published
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/stories/${row.id}`}
                      className="font-medium text-[var(--ink)] hover:underline"
                    >
                      {row.title}
                    </Link>
                    {row.featured ? (
                      <span className="ml-2 rounded bg-[var(--cream-dark)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                        Featured
                      </span>
                    ) : null}
                    <p className="mt-0.5 font-mono text-xs text-[var(--muted)]">
                      /stories/{row.slug}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--muted)] sm:table-cell">
                    {storyCategoryLabel(row.category)}
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--muted)] md:table-cell">
                    {formatStoryDate(row.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        row.status === "published"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {row.status === "published" ? (
                        <a
                          href={storyHref(row)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[var(--muted)] underline"
                        >
                          View
                        </a>
                      ) : null}
                      <Link
                        href={`/admin/stories/${row.id}`}
                        className="text-xs font-medium underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void remove(row.id, row.title)}
                        className="text-xs font-medium text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
