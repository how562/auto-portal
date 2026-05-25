"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SitePage } from "@/lib/cmsTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface SitePagesManagerProps {
  initialPages: SitePage[];
}

export function SitePagesManager({ initialPages }: SitePagesManagerProps) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
        }),
      });
      const data = (await res.json()) as { page?: SitePage; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      if (data.page) {
        router.push(`/admin/pages/${data.page.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function setStatus(page: SitePage, status: "draft" | "published") {
    const res = await fetch(`/api/admin/site-pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    const data = (await res.json()) as { page?: SitePage; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Update failed");
      return;
    }
    if (data.page) {
      setPages((prev) =>
        prev.map((p) => (p.id === data.page!.id ? data.page! : p)),
      );
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={createPage}
        className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          New page
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-[var(--muted)]">Title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              placeholder="About us"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-[var(--muted)]">
              Slug (optional)
            </span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              placeholder="about-us"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className={`${btnPrimaryMd} disabled:opacity-60`}
          >
            {creating ? "Creating…" : "Create page"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </form>

      {pages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          No pages yet. Create one above.
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          {pages.map((page) => (
            <li
              key={page.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div className="min-w-0">
                <Link
                  href={`/admin/pages/${page.id}`}
                  className="font-medium hover:underline"
                >
                  {page.title}
                </Link>
                <p className="text-sm text-[var(--muted)]">
                  /{page.slug} ·{" "}
                  <span
                    className={
                      page.status === "published"
                        ? "text-emerald-700"
                        : undefined
                    }
                  >
                    {page.status}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/pages/${page.id}/preview`}
                  className={btnSecondaryMd}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </Link>
                {page.status === "published" ? (
                  <>
                    <Link
                      href={`/${page.slug}`}
                      className={btnSecondaryMd}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live
                    </Link>
                    <button
                      type="button"
                      className={btnSecondaryMd}
                      onClick={() => setStatus(page, "draft")}
                    >
                      Unpublish
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={btnPrimaryMd}
                    onClick={() => setStatus(page, "published")}
                  >
                    Publish
                  </button>
                )}
                <Link href={`/admin/pages/${page.id}`} className={btnSecondaryMd}>
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
