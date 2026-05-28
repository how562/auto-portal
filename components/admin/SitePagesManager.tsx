"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { CreatePageFromTemplate } from "@/components/admin/CreatePageFromTemplate";
import { DeletePageDialog } from "@/components/admin/DeletePageDialog";
import { DuplicatePageDialog } from "@/components/admin/DuplicatePageDialog";
import { slugifyBlueprintSlug } from "@/lib/cmsPageBlueprint";
import type { AdminSitePageListItem, SitePage } from "@/lib/cmsTypes";
import { getDedicatedSitePage } from "@/lib/dedicatedSitePages";
import { CMS_DEMO_SLUG } from "@/lib/cmsDemoConstants";
import { getSitePageDeletePolicy } from "@/lib/sitePageDeletePolicy";
import {
  filterAdminSitePages,
  findCmsDemoPage,
  formatSitePageUpdatedAt,
  getSitePageDisplayTitle,
  getSitePageLiveHref,
  partitionAdminSitePages,
} from "@/lib/sitePagesListUtils";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface SitePagesManagerProps {
  initialPages: AdminSitePageListItem[];
}

type CreateMode = "template" | "blank" | "inventory" | null;

function mergePagePatch(
  existing: AdminSitePageListItem,
  patch: SitePage,
): AdminSitePageListItem {
  return {
    ...existing,
    ...patch,
    section_count: existing.section_count,
  };
}

export function SitePagesManager({ initialPages }: SitePagesManagerProps) {
  const router = useRouter();
  const [pages, setPages] = useState(initialPages);
  const [createMode, setCreateMode] = useState<CreateMode>(null);
  const [duplicatePage, setDuplicatePage] = useState<AdminSitePageListItem | null>(null);
  const [deletePage, setDeletePage] = useState<AdminSitePageListItem | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [inventoryCondition, setInventoryCondition] = useState<
    "all" | "new" | "used" | "cpo"
  >("used");
  const [openingCmsDemo, setOpeningCmsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPages = useMemo(
    () => filterAdminSitePages(pages, { query: searchQuery }),
    [pages, searchQuery],
  );

  const { live: livePages, drafts: draftPages, cmsDemo: cmsDemoInList } = useMemo(
    () => partitionAdminSitePages(filteredPages),
    [filteredPages],
  );

  const cmsDemoPage = useMemo(() => findCmsDemoPage(pages), [pages]);
  const hasActiveSearch = searchQuery.trim().length > 0;
  const totalVisible = livePages.length + draftPages.length + (cmsDemoInList ? 1 : 0);

  async function refreshPagesList() {
    const res = await fetch("/api/admin/site-pages", { credentials: "include" });
    const data = (await res.json()) as { pages?: AdminSitePageListItem[]; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Could not refresh pages");
    if (data.pages) setPages(data.pages);
  }

  async function openCmsDemoPage() {
    setOpeningCmsDemo(true);
    setError(null);
    try {
      const existing = cmsDemoPage;
      if (existing) {
        router.push(`/admin/pages/${existing.id}`);
        return;
      }
      const res = await fetch("/api/admin/site-pages/cms-demo", {
        method: "POST",
        credentials: "include",
      });
      const data = (await res.json()) as { page?: SitePage; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not open CMS Demo");
      if (data.page) {
        setPages((prev) => {
          const without = prev.filter((p) => p.slug !== data.page!.slug);
          return [
            ...without,
            { ...data.page!, section_count: 0 } satisfies AdminSitePageListItem,
          ];
        });
        router.push(`/admin/pages/${data.page.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not open CMS Demo");
    } finally {
      setOpeningCmsDemo(false);
    }
  }

  async function createInventoryPage(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const inventory_preset: Record<string, string> = {};
      if (inventoryCondition !== "all") {
        inventory_preset.condition = inventoryCondition;
      }
      const res = await fetch("/api/admin/site-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim() || undefined,
          status: "draft",
          page_type: "inventory",
          inventory_preset,
        }),
      });
      const data = (await res.json()) as { page?: SitePage; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      if (data.page) {
        setPages((prev) => [
          ...prev,
          { ...data.page!, section_count: 0 } satisfies AdminSitePageListItem,
        ]);
        router.push(`/admin/pages/${data.page.id}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

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
          page_type: "cms",
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

  async function publishPage(page: AdminSitePageListItem) {
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
        prev.map((p) => (p.id === data.page!.id ? mergePagePatch(p, data.page!) : p)),
      );
    }
  }

  function handlePageDeleted(pageId: string) {
    setPages((prev) => prev.filter((p) => p.id !== pageId));
    setDeletePage(null);
  }

  async function unpublishPage(page: AdminSitePageListItem) {
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
        prev.map((p) => (p.id === data.page!.id ? mergePagePatch(p, data.page!) : p)),
      );
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={createMode === "template" ? btnPrimaryMd : btnSecondaryMd}
            onClick={() => setCreateMode(createMode === "template" ? null : "template")}
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
          <button
            type="button"
            className={createMode === "inventory" ? btnPrimaryMd : btnSecondaryMd}
            onClick={() =>
              setCreateMode(createMode === "inventory" ? null : "inventory")
            }
          >
            Inventory listing
          </button>
          <button
            type="button"
            className={btnSecondaryMd}
            disabled={openingCmsDemo}
            onClick={() => void openCmsDemoPage()}
          >
            {openingCmsDemo ? "Opening…" : "CMS Demo page"}
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

      {createMode === "inventory" ? (
        <form
          onSubmit={createInventoryPage}
          className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Inventory listing page
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            A dedicated URL (e.g. /pre-owned) that shows inventory with locked filters.
            Refine filters after creation in the page editor.
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
                placeholder="Pre-Owned"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--muted)]">Slug</span>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                onBlur={() => setSlug(slugifyBlueprintSlug(slug))}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 font-mono text-sm"
                placeholder="pre-owned"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium text-[var(--muted)]">Condition</span>
              <select
                value={inventoryCondition}
                onChange={(e) =>
                  setInventoryCondition(
                    e.target.value as "all" | "new" | "used" | "cpo",
                  )
                }
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              >
                <option value="used">Pre-owned</option>
                <option value="new">New</option>
                <option value="cpo">CPO</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={creating || !title.trim() || inventoryCondition === "all"}
              className={`${btnPrimaryMd} disabled:opacity-60`}
            >
              {creating ? "Creating…" : "Create inventory page"}
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
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 font-mono text-sm"
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
            <button type="button" className={btnSecondaryMd} onClick={() => setCreateMode(null)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            {hasActiveSearch ? (
              <>
                <strong className="font-semibold text-[var(--ink)]">{totalVisible}</strong> matching
                page{totalVisible === 1 ? "" : "s"} across Live, Drafts, and CMS workbench
              </>
            ) : (
              <>
                <strong className="font-semibold text-[var(--ink)]">{pages.length}</strong> pages in
                CMS
              </>
            )}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="pages-search">
              Search pages
            </label>
            <input
              id="pages-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title or slug…"
              className="w-full min-w-[12rem] rounded-lg border border-[var(--line)] px-3 py-2 text-sm sm:w-56"
            />
            {hasActiveSearch ? (
              <button
                type="button"
                className={btnSecondaryMd}
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
            ) : null}
            <button
              type="button"
              className={btnSecondaryMd}
              onClick={() => void refreshPagesList().catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Refresh failed");
              })}
            >
              Refresh
            </button>
          </div>
        </div>

        {pages.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
            No pages in site_pages yet. Create one from a template above.
          </p>
        ) : totalVisible === 0 && hasActiveSearch ? (
          <p className="rounded-2xl border border-dashed border-[var(--line-dark)] bg-[var(--cream)]/40 px-6 py-12 text-center text-sm text-[var(--muted)]">
            No pages match your search.{" "}
            <button
              type="button"
              className="font-medium text-[var(--ink)] underline"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </button>
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
                  . Includes dedicated routes such as Executive Team.
                </>
              }
              count={livePages.length}
              emptyMessage="No live pages yet. Publish a draft to make it available on the site and in nav."
              pages={livePages}
              onPublish={publishPage}
              onUnpublish={unpublishPage}
              onDuplicate={setDuplicatePage}
              onDelete={setDeletePage}
              variant="live"
            />

            <SitePagesSection
              title="Drafts"
              description="Unpublished work in progress — not visible on the public site until you publish. Drafts can be deleted when you no longer need them."
              count={draftPages.length}
              emptyMessage="No drafts. New pages start here until you publish them."
              pages={draftPages}
              onPublish={publishPage}
              onUnpublish={unpublishPage}
              onDuplicate={setDuplicatePage}
              onDelete={setDeletePage}
              variant="draft"
            />

            {cmsDemoInList ? (
              <SitePagesSection
                title="CMS workbench"
                description="Sandbox for section types at /cms-demo. Kept as a draft so it never appears in Live or navigation — use it to preview how sections look."
                count={1}
                emptyMessage=""
                pages={[cmsDemoInList]}
                onPublish={publishPage}
                onUnpublish={unpublishPage}
                onDuplicate={setDuplicatePage}
                onDelete={setDeletePage}
                variant="workbench"
              />
            ) : null}
          </div>
        )}
      </section>

      {duplicatePage ? (
        <DuplicatePageDialog page={duplicatePage} onClose={() => setDuplicatePage(null)} />
      ) : null}

      {deletePage ? (
        <DeletePageDialog
          page={deletePage}
          onClose={() => setDeletePage(null)}
          onDeleted={handlePageDeleted}
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
  pages: AdminSitePageListItem[];
  onPublish: (page: AdminSitePageListItem) => void;
  onUnpublish: (page: AdminSitePageListItem) => void;
  onDuplicate: (page: AdminSitePageListItem) => void;
  onDelete: (page: AdminSitePageListItem) => void;
  variant: "live" | "draft" | "workbench";
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
  onDelete,
  variant,
}: SitePagesSectionProps) {
  const badgeClass =
    variant === "live"
      ? "bg-emerald-100 text-emerald-800"
      : variant === "workbench"
        ? "bg-violet-100 text-violet-900"
        : "bg-[var(--cream)] text-[var(--muted)]";

  return (
    <section className="space-y-3">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
          {title}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold normal-case tracking-normal ${badgeClass}`}
          >
            {count}
          </span>
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">{description}</p>
      </div>

      {pages.length === 0 ? (
        emptyMessage ? (
          <p className="rounded-2xl border border-dashed border-[var(--line-dark)] bg-[var(--cream)]/40 px-5 py-8 text-center text-sm text-[var(--muted)]">
            {emptyMessage}
          </p>
        ) : null
      ) : (
        <SitePagesTable
          pages={pages}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}
    </section>
  );
}

interface SitePagesTableProps {
  pages: AdminSitePageListItem[];
  onPublish: (page: AdminSitePageListItem) => void;
  onUnpublish: (page: AdminSitePageListItem) => void;
  onDuplicate: (page: AdminSitePageListItem) => void;
  onDelete: (page: AdminSitePageListItem) => void;
}

function SitePagesTable({
  pages,
  onPublish,
  onUnpublish,
  onDuplicate,
  onDelete,
}: SitePagesTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-white">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[var(--cream)]/50 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Slug</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Updated</th>
            <th className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line)]">
          {pages.map((page) => (
            <SitePageTableRow
              key={page.id}
              page={page}
              onPublish={onPublish}
              onUnpublish={onUnpublish}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface SitePageTableRowProps {
  page: AdminSitePageListItem;
  onPublish: (page: AdminSitePageListItem) => void;
  onUnpublish: (page: AdminSitePageListItem) => void;
  onDuplicate: (page: AdminSitePageListItem) => void;
  onDelete: (page: AdminSitePageListItem) => void;
}

function SitePageTableRow({
  page,
  onPublish,
  onUnpublish,
  onDuplicate,
  onDelete,
}: SitePageTableRowProps) {
  const isPublished = page.status === "published";
  const dedicated = getDedicatedSitePage(page.slug);
  const liveHref = dedicated?.livePath ?? getSitePageLiveHref(page);
  const isSystemLive = Boolean(dedicated?.keepPublished);
  const isCmsDemo = page.slug === CMS_DEMO_SLUG;
  const previewHref = isCmsDemo ? `/${page.slug}` : `/admin/pages/${page.id}/preview`;
  const isInventoryPage = page.page_type === "inventory";
  const hasNoSections = !isInventoryPage && page.section_count === 0;
  const deletePolicy = getSitePageDeletePolicy(page);

  return (
    <tr className="align-middle hover:bg-[var(--cream)]/30">
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/pages/${page.id}`} className="font-medium hover:underline">
            {getSitePageDisplayTitle(page)}
          </Link>
          {isInventoryPage ? (
            <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900">
              Inventory
            </span>
          ) : null}
          {hasNoSections ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
              No sections
            </span>
          ) : null}
          {dedicated ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
              Dedicated
            </span>
          ) : null}
          {isCmsDemo ? (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-900">
              Workbench
            </span>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
        {page.slug === "home" ? "/" : `/${page.slug}`}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
            isPublished
              ? "bg-emerald-100 text-emerald-800"
              : "bg-[var(--cream-dark)] text-[var(--muted)]"
          }`}
        >
          {page.status}
        </span>
      </td>
      <td className="hidden px-4 py-3 text-[var(--muted)] md:table-cell">
        {formatSitePageUpdatedAt(page.updated_at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={previewHref}
            className={btnSecondaryMd}
            target="_blank"
            rel="noreferrer"
          >
            Preview
          </Link>
          {!isCmsDemo ? (
            <button type="button" className={btnSecondaryMd} onClick={() => onDuplicate(page)}>
              Duplicate
            </button>
          ) : null}
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
          ) : isCmsDemo ? null : (
            <button type="button" className={btnPrimaryMd} onClick={() => onPublish(page)}>
              Publish
            </button>
          )}
          <Link href={`/admin/pages/${page.id}`} className={btnSecondaryMd}>
            Edit
          </Link>
          {deletePolicy.canDelete ? (
            <button
              type="button"
              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50"
              onClick={() => onDelete(page)}
            >
              Delete
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
