"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CmsSectionEditorCard,
  type CollectionOption,
} from "@/components/admin/CmsSectionEditorCard";
import { CmsSectionDebugPanel } from "@/components/admin/CmsSectionDebugPanel";
import type { CMSSection } from "@/lib/cmsSectionModel";
import { listRegistryEntriesForBuilder } from "@/lib/cmsSectionRegistry";
import type { CMSSectionType, SitePage } from "@/lib/cmsTypes";
import { getDedicatedSitePage } from "@/lib/dedicatedSitePages";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface PageBuilderProps {
  /** Canonical page id from the route (used for all section writes). */
  pageId: string;
  page: SitePage;
  initialSections: CMSSection[];
  collections: CollectionOption[];
}

export function PageBuilder({
  pageId,
  page: initialPage,
  initialSections,
  collections,
}: PageBuilderProps) {
  const router = useRouter();
  const [page, setPage] = useState(initialPage);
  const [sections, setSections] = useState(initialSections);
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [metaDescription, setMetaDescription] = useState(page.meta_description ?? "");
  const [newSectionType, setNewSectionType] = useState<CMSSectionType>("hero");
  const [savingPage, setSavingPage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [exportingBlueprint, setExportingBlueprint] = useState(false);
  const [blueprintCopied, setBlueprintCopied] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageMissing, setPageMissing] = useState(false);
  const dedicatedPage = getDedicatedSitePage(page.slug);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/admin/site-pages/${pageId}`, {
        credentials: "include",
      });
      if (cancelled) return;
      if (res.status === 404) {
        setPageMissing(true);
        setError(
          "This page is not in the database. Go to Site pages and open the page from the list.",
        );
      } else if (res.status === 503) {
        const data = (await res.json()) as { error?: string };
        setError(
          data.error ??
            "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the dev server.",
        );
      } else if (res.ok) {
        const data = (await res.json()) as { page?: SitePage };
        if (data.page) {
          setPage(data.page);
          setTitle(data.page.title);
          setSlug(data.page.slug);
          setPageMissing(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  const savePageSettings = useCallback(async () => {
    setSavingPage(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site-pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          meta_description: metaDescription.trim() || null,
        }),
      });
      const data = (await res.json()) as { page?: SitePage; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      if (data.page) {
        setPage(data.page);
        setTitle(data.page.title);
        setSlug(data.page.slug);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingPage(false);
    }
  }, [pageId, title, slug, metaDescription, router]);

  async function setPageStatus(nextStatus: "draft" | "published") {
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site-pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          meta_description: metaDescription.trim() || null,
          status: nextStatus,
        }),
      });
      const data = (await res.json()) as { page?: SitePage; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      if (data.page) {
        setPage(data.page);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPublishing(false);
    }
  }

  async function exportBlueprint() {
    setExportingBlueprint(true);
    setBlueprintCopied(false);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site-pages/${pageId}/blueprint`, {
        credentials: "include",
      });
      const data = (await res.json()) as { json?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Export failed");
      if (data.json) {
        await navigator.clipboard.writeText(data.json);
        setBlueprintCopied(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExportingBlueprint(false);
    }
  }

  async function addSection() {
    if (pageMissing) return;
    setAddingSection(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/page-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          page_id: pageId,
          section_type: newSectionType,
        }),
      });
      const data = (await res.json()) as { section?: CMSSection; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Add failed");
      if (data.section) {
        setSections((prev) => [...prev, data.section!]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Add failed");
    } finally {
      setAddingSection(false);
    }
  }

  async function reorder(index: number, direction: "up" | "down") {
    const other = direction === "up" ? index - 1 : index + 1;
    if (other < 0 || other >= sections.length) return;
    const a = sections[index];
    const b = sections[other];
    const res = await fetch("/api/admin/page-sections/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ sectionIdA: a.id, sectionIdB: b.id }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Reorder failed");
      return;
    }
    setSections((prev) => {
      const next = [...prev];
      [next[index], next[other]] = [next[other], next[index]];
      return next.map((s, i) => ({ ...s, sort_order: i * 10 }));
    });
    router.refresh();
  }

  async function deleteSection(sectionId: string) {
    if (!confirm("Delete this section?")) return;
    const res = await fetch(`/api/admin/page-sections/${sectionId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Delete failed");
      return;
    }
    setSections((prev) => prev.filter((s) => s.id !== sectionId));
  }

  async function deletePage() {
    if (!confirm(`Delete page "${page.title}" and all sections?`)) return;
    const res = await fetch(`/api/admin/site-pages/${pageId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Delete failed");
      return;
    }
    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/pages"
          className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← All pages
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Page builder</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/pages/${pageId}/preview`}
              target="_blank"
              rel="noreferrer"
              className={btnSecondaryMd}
            >
              Preview draft
            </Link>
            {page.status === "published" ? (
              <Link
                href={dedicatedPage?.livePath ?? `/${page.slug}`}
                target="_blank"
                rel="noreferrer"
                className={btnSecondaryMd}
              >
                Live URL
              </Link>
            ) : null}
            <button
              type="button"
              disabled={exportingBlueprint}
              onClick={exportBlueprint}
              className={`${btnSecondaryMd} disabled:opacity-60`}
            >
              {exportingBlueprint
                ? "Exporting…"
                : blueprintCopied
                  ? "Blueprint copied"
                  : "Export blueprint"}
            </button>
            <Link href="/admin/page-blueprints" className={btnSecondaryMd}>
              Import blueprint
            </Link>
          </div>
        </div>
      </div>

      {dedicatedPage ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">Dedicated layout page</p>
          <p className="mt-1">
            Live at{" "}
            <a
              href={dedicatedPage.livePath}
              className="font-medium underline"
              target="_blank"
              rel="noreferrer"
            >
              {dedicatedPage.livePath}
            </a>
            . Page body copy is edited in{" "}
            <code className="rounded bg-white/80 px-1 py-0.5 text-xs">
              {dedicatedPage.contentSource}
            </code>
            . You can update SEO title and meta description below, add CMS
            sections for notes or future blocks, and use Preview — the public
            layout always uses the dedicated template.
          </p>
          {dedicatedPage.keepPublished ? (
            <p className="mt-2 text-xs text-amber-900/90">
              This is a system page and stays published so navigation and live
              URLs keep working.
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Page settings
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--muted)]">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--muted)]">Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              readOnly={Boolean(dedicatedPage)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm read-only:bg-[var(--cream)] read-only:text-[var(--muted)]"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-[var(--muted)]">
              Meta description (SEO)
            </span>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
            />
          </label>
          <div className="block space-y-1">
            <span className="text-xs font-medium text-[var(--muted)]">Status</span>
            <p className="rounded-xl border border-[var(--line)] bg-[var(--cream)] px-4 py-2.5 text-sm capitalize">
              {page.status}
              {page.status !== "published" ? (
                <span className="text-[var(--muted)]"> — not visible on the public site</span>
              ) : null}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={savingPage}
            onClick={savePageSettings}
            className={`${btnPrimaryMd} disabled:opacity-60`}
          >
            {savingPage ? "Saving…" : "Save settings"}
          </button>
          {dedicatedPage?.keepPublished ? (
            <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">
              Live (system page)
            </span>
          ) : page.status === "published" ? (
            <button
              type="button"
              disabled={publishing}
              onClick={() => setPageStatus("draft")}
              className={`${btnSecondaryMd} disabled:opacity-60`}
            >
              {publishing ? "Updating…" : "Unpublish"}
            </button>
          ) : (
            <button
              type="button"
              disabled={publishing}
              onClick={() => setPageStatus("published")}
              className={`${btnSecondaryMd} disabled:opacity-60`}
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
          )}
          {dedicatedPage ? null : (
            <button type="button" onClick={deletePage} className={`${btnSecondaryMd} text-red-700`}>
              Delete page
            </button>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Add section
            </span>
            <select
              value={newSectionType}
              onChange={(e) => setNewSectionType(e.target.value as CMSSectionType)}
              disabled={pageMissing}
              className="block min-w-[12rem] rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm disabled:opacity-60"
            >
              {listRegistryEntriesForBuilder().map((entry) => (
                <option key={entry.type} value={entry.type}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={addingSection || pageMissing}
            onClick={addSection}
            className={`${btnPrimaryMd} disabled:opacity-60`}
          >
            {addingSection ? "Adding…" : "Add section"}
          </button>
          {pageMissing ? (
            <Link href="/admin/pages" className={btnSecondaryMd}>
              Back to Site pages
            </Link>
          ) : null}
        </div>

        {sections.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            No sections yet. Add a section above.
          </p>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <CmsSectionEditorCard
                key={section.id}
                section={section}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
                collections={collections}
                onMoveUp={() => reorder(index, "up")}
                onMoveDown={() => reorder(index, "down")}
                onDelete={() => deleteSection(section.id)}
                onSaved={(updated) =>
                  setSections((prev) =>
                    prev.map((s) => (s.id === updated.id ? updated : s)),
                  )
                }
              />
            ))}
          </div>
        )}
      </section>

      <CmsSectionDebugPanel sections={sections} />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
