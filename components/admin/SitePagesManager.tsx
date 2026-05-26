"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreatePageFromTemplate } from "@/components/admin/CreatePageFromTemplate";
import { DuplicatePageDialog } from "@/components/admin/DuplicatePageDialog";
import { slugifyBlueprintSlug } from "@/lib/cmsPageBlueprint";
import type { SitePage } from "@/lib/cmsTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface SitePagesManagerProps {
  initialPages: SitePage[];
}

type CreateMode = "template" | "blank" | null;

export function SitePagesManager({ initialPages }: SitePagesManagerProps) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [duplicatePage, setDuplicatePage] = useState<SitePage | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBlankPage(e: React.FormEvent) {
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
          status: "draft",
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

  async function publishPage(page: SitePage) {
    const res = await fetch(`/api/admin/site-pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "published" }),
    });
    const data = (await res.json()) as { page?: SitePage; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Publish failed");
      return;
    }
    if (data.page) {
      setPages((prev) =>
        prev.map((p) => (p.id === data.page!.id ? data.page! : p)),
      );
    }
  }

  async function unpublishPage(page: SitePage) {
    const res = await fetch(`/api/admin/site-pages/${page.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "draft" }),
    });
    const data = (await res.json()) as { page?: SitePage; error?: string };
    if (!res.ok) {
      setError(data.error ?? "Unpublish failed");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={
              createMode === "template" ? btnPrimaryMd : btnSecondaryMd
            }
            onClick={() =>
              setCreateMode(createMode === "template" ? null : "template")
            }
          >
            Create from template
          </button>
          <button
            type="button"
            className={createMode === "blank" ? btnPrimaryMd : btnSecondaryMd}
            onClick={() => setCreateMode(createMode === "blank" ? null : "blank")}
          >
            Blank page
          </button>
        </div>
        <Link href="/admin/page-blueprints" className={btnSecondaryMd}>
          Page blueprints
        </Link>
      </div>

      {createMode === "template" ? (
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
          <CreatePageFromTemplate onCancel={() => setCreateMode(null)} />
        </section>
      ) : null}

      {createMode === "blank" ? (
        <form
          onSubmit={createBlankPage}
          className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Blank page
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Empty draft — add sections manually in the page builder.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-[var(--muted)]">Title</span>
              <input
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) {
                    setSlug(slugifyBlueprintSlug(e.target.value));
                  }
                }}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
                placeholder="About us"
              />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-[var(--muted)]">Slug</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                onBlur={() => setSlug(slugifyBlueprintSlug(slug))}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-mono"
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
              {creating ? "Creating…" : "Create draft"}
            </button>
            <button
              type="button"
              className={btnSecondaryMd}
              onClick={() => setCreateMode(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {pages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          No pages yet. Create one from a template above.
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
                <button
                  type="button"
                  className={btnSecondaryMd}
                  onClick={() => setDuplicatePage(page)}
                >
                  Duplicate
                </button>
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
                      onClick={() => unpublishPage(page)}
                    >
                      Unpublish
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={btnPrimaryMd}
                    onClick={() => publishPage(page)}
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

      {duplicatePage ? (
        <DuplicatePageDialog
          page={duplicatePage}
          onClose={() => setDuplicatePage(null)}
        />
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
