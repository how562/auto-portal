"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  CmsSectionEditorCard,
  type CollectionOption,
} from "@/components/admin/CmsSectionEditorCard";
import { CmsSectionDebugPanel } from "@/components/admin/CmsSectionDebugPanel";
import type { CMSSection } from "@/lib/cmsSectionModel";
import { listRegistryEntriesForBuilder } from "@/lib/cmsSectionRegistry";
import type { CMSSectionType, SitePage } from "@/lib/cmsTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface PageBuilderProps {
  page: SitePage;
  initialSections: CMSSection[];
  collections: CollectionOption[];
}

export function PageBuilder({
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
  const [status, setStatus] = useState<"draft" | "published">(
    page.status === "published" ? "published" : "draft",
  );
  const [newSectionType, setNewSectionType] = useState<CMSSectionType>("hero");
  const [savingPage, setSavingPage] = useState(false);
  const [addingSection, setAddingSection] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savePage = useCallback(async () => {
    setSavingPage(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site-pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          meta_description: metaDescription.trim() || null,
          status,
        }),
      });
      const data = (await res.json()) as { page?: SitePage; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      if (data.page) {
        setPage(data.page);
        setTitle(data.page.title);
        setSlug(data.page.slug);
        setStatus(data.page.status === "published" ? "published" : "draft");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingPage(false);
    }
  }, [page.id, title, slug, metaDescription, status, router]);

  async function addSection() {
    setAddingSection(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/page-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          page_id: page.id,
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
    const res = await fetch(`/api/admin/site-pages/${page.id}`, {
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
              href={`/admin/pages/${page.id}/preview`}
              target="_blank"
              rel="noreferrer"
              className={btnSecondaryMd}
            >
              Preview
            </Link>
            {page.status === "published" ? (
              <Link
                href={`/${page.slug}`}
                target="_blank"
                rel="noreferrer"
                className={btnSecondaryMd}
              >
                Live URL
              </Link>
            ) : null}
          </div>
        </div>
      </div>

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
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
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
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--muted)]">Status</span>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value === "published" ? "published" : "draft")
              }
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={savingPage}
            onClick={savePage}
            className={`${btnPrimaryMd} disabled:opacity-60`}
          >
            {savingPage ? "Saving…" : "Save page"}
          </button>
          <button type="button" onClick={deletePage} className={`${btnSecondaryMd} text-red-700`}>
            Delete page
          </button>
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
              className="block min-w-[12rem] rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
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
            disabled={addingSection}
            onClick={addSection}
            className={`${btnPrimaryMd} disabled:opacity-60`}
          >
            {addingSection ? "Adding…" : "Add section"}
          </button>
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
