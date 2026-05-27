"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { CreatePageFromTemplate } from "@/components/admin/CreatePageFromTemplate";
import { DuplicatePageDialog } from "@/components/admin/DuplicatePageDialog";
import { slugifyBlueprintSlug } from "@/lib/cmsPageBlueprint";
import type { SitePage } from "@/lib/cmsTypes";
import { getDedicatedSitePage } from "@/lib/dedicatedSitePages";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface SitePagesManagerProps {
  initialPages: SitePage[];
}

type CreateMode = "template" | "blank" | null;

function sortPages(pages: SitePage[]): SitePage[] {
  return [...pages].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));
}

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

  const livePages = useMemo(
    () => sortPages(pages.filter((p) => p.status === "published")),
    [pages],
  );
  const draftPages = useMemo(
    () => sortPages(pages.filter((p) => p.status !== "published")),
    [pages],
  );

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
        <div className="space-y-8">
          <SitePagesSection
            title="Live"
            description={
              <>
                Published pages are public and safe to link from{" "}
                <Link href="/admin/navigation" className="font-medium text-[var(--ink)] underline">
                  Navigation
                </Link>
                .
              </>
            }
            count={livePages.length}
            emptyMessage="No live pages yet. Publish a draft to make it available on the site and in nav."
            pages={livePages}
            onPublish={publishPage}
            onUnpublish={unpublishPage}
            onDuplicate={setDuplicatePage}
          />

          <SitePagesSection
            title="Drafts"
            description="Unpublished work in progress — not visible on the public site until you publish."
            count={draftPages.length}
            emptyMessage="No drafts. New pages start here until you publish them."
            pages={draftPages}
            onPublish={publishPage}
            onUnpublish={unpublishPage}
            onDuplicate={setDuplicatePage}
          />
        </div>
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

interface SitePagesSectionProps {
  title: string;
  description: ReactNode;
  count: number;
  emptyMessage: string;
  pages: SitePage[];
  onPublish: (page: SitePage) => void;
  onUnpublish: (page: SitePage) => void;
  onDuplicate: (page: SitePage) => void;
}

function SitePagesSection({
  title,
  description,
  count,
  emptyMessage,
  pages,
  onPublish,
  onUnpublish,
  onDuplicate,
}: SitePagesSectionProps) {
  const isLive = title === "Live";

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
            {title}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold normal-case tracking-normal ${
                isLive
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-[var(--cream)] text-[var(--muted)]"
              }`}
            >
              {count}
            </span>
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{description}</p>
        </div>
      </div>

      {pages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line-dark)] bg-[var(--cream)]/40 px-5 py-8 text-center text-sm text-[var(--muted)]">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
          {pages.map((page) => (
            <SitePageListRow
              key={page.id}
              page={page}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              onDuplicate={onDuplicate}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

interface SitePageListRowProps {
  page: SitePage;
  onPublish: (page: SitePage) => void;
  onUnpublish: (page: SitePage) => void;
  onDuplicate: (page: SitePage) => void;
}

function SitePageListRow({
  page,
  onPublish,
  onUnpublish,
  onDuplicate,
}: SitePageListRowProps) {
  const isPublished = page.status === "published";
  const dedicated = getDedicatedSitePage(page.slug);
  const liveHref = dedicated?.livePath ?? `/${page.slug}`;
  const isSystemLive = Boolean(dedicated?.keepPublished);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
      <div className="min-w-0">
        <Link
          href={`/admin/pages/${page.id}`}
          className="font-medium hover:underline"
        >
          {page.title}
        </Link>
        <p className="text-sm text-[var(--muted)]">
          /{page.slug}
          {dedicated ? (
            <span className="text-amber-800"> · dedicated layout</span>
          ) : null}
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
        <button type="button" className={btnSecondaryMd} onClick={() => onDuplicate(page)}>
          Duplicate
        </button>
        {isPublished ? (
          <>
            <Link
              href={liveHref}
              className={btnSecondaryMd}
              target="_blank"
              rel="noreferrer"
            >
              Live
            </Link>
            {isSystemLive ? null : (
              <button type="button" className={btnSecondaryMd} onClick={() => onUnpublish(page)}>
                Unpublish
              </button>
            )}
          </>
        ) : (
          <button type="button" className={btnPrimaryMd} onClick={() => onPublish(page)}>
            Publish
          </button>
        )}
        <Link href={`/admin/pages/${page.id}`} className={btnSecondaryMd}>
          Edit
        </Link>
      </div>
    </li>
  );
}
