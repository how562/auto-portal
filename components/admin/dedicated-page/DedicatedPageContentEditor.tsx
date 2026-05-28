"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AboutUsContentForm } from "@/components/admin/dedicated-page/AboutUsContentForm";
import { CavenderCommitmentContentForm } from "@/components/admin/dedicated-page/CavenderCommitmentContentForm";
import { ExecutiveTeamContentForm } from "@/components/admin/dedicated-page/ExecutiveTeamContentForm";
import { LocationsContentForm } from "@/components/admin/dedicated-page/LocationsContentForm";
import { ScheduleServiceContentForm } from "@/components/admin/dedicated-page/ScheduleServiceContentForm";
import { ValueYourTradeContentForm } from "@/components/admin/dedicated-page/ValueYourTradeContentForm";
import type { SitePage } from "@/lib/cmsTypes";
import type { DedicatedPageContent, DedicatedPageSlug } from "@/lib/dedicatedPageContent";
import { getDedicatedSitePage } from "@/lib/dedicatedSitePages";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface DedicatedPageContentEditorProps {
  pageId: string;
  page: SitePage;
}

export function DedicatedPageContentEditor({
  pageId,
  page: initialPage,
}: DedicatedPageContentEditorProps) {
  const slug = initialPage.slug as DedicatedPageSlug;
  const dedicated = getDedicatedSitePage(slug);

  const [page, setPage] = useState(initialPage);
  const [content, setContent] = useState<DedicatedPageContent | null>(null);
  const [title, setTitle] = useState(initialPage.title);
  const [metaDescription, setMetaDescription] = useState(
    initialPage.meta_description ?? "",
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site-pages/${pageId}/dedicated-content`, {
        credentials: "include",
      });
      const data = (await res.json()) as {
        content?: DedicatedPageContent;
        page?: SitePage;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load content");
      if (data.content) setContent(data.content);
      if (data.page) {
        setPage(data.page);
        setTitle(data.page.title);
        setMetaDescription(data.page.meta_description ?? "");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function savePageSettings() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/site-pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          meta_description: metaDescription.trim() || null,
        }),
      });
      const data = (await res.json()) as { page?: SitePage; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save settings");
      if (data.page) setPage(data.page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveContent() {
    if (!content) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/admin/site-pages/${pageId}/dedicated-content`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      const data = (await res.json()) as {
        content?: DedicatedPageContent;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to save content");
      if (data.content) setContent(data.content);
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveAll() {
    await savePageSettings();
    await saveContent();
  }

  const liveHref = dedicated?.livePath ?? `/${page.slug}`;

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
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{page.title}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Dedicated layout · <span className="font-mono">/{page.slug}</span> ·{" "}
              <span className="capitalize">{page.status}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={liveHref}
              target="_blank"
              rel="noreferrer"
              className={btnSecondaryMd}
            >
              View live page
            </Link>
            <button
              type="button"
              disabled={saving || loading || !content}
              onClick={() => void saveAll()}
              className={`${btnPrimaryMd} disabled:opacity-60`}
            >
              {saving ? "Saving…" : "Save all"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream)]/50 px-5 py-4 text-sm text-[var(--muted)]">
        Edit text, images, and links below. The public page keeps the same layout and
        styling — only the content source changes. Store-driven cards (locations,
        service) still use database store records.
      </div>

      <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          SEO & page settings
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-[var(--muted)]">Page title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-[var(--muted)]">
              Meta description
            </span>
            <textarea
              rows={2}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
            />
          </label>
        </div>
      </section>

      {loading ? (
        <p className="text-sm text-[var(--muted)]">Loading page content…</p>
      ) : !content ? (
        <p className="text-sm text-red-600">Could not load page content.</p>
      ) : (
        <>
          {slug === "about-us" ? (
            <AboutUsContentForm
              content={content as import("@/lib/aboutUsPageContent").AboutUsPageContent}
              onChange={setContent}
            />
          ) : slug === "locations" ? (
            <LocationsContentForm
              content={content as import("@/lib/locationsPageTypes").LocationsPageContent}
              onChange={setContent}
            />
          ) : slug === "schedule-service" ? (
            <ScheduleServiceContentForm
              content={
                content as import("@/lib/serviceSchedulingTypes").ScheduleServicePageContent
              }
              onChange={setContent}
            />
          ) : slug === "executive-team" ? (
            <ExecutiveTeamContentForm
              content={
                content as import("@/lib/executiveTeamPageContent").ExecutiveTeamPageContent
              }
              onChange={setContent}
            />
          ) : slug === "cavender-commitment" ? (
            <CavenderCommitmentContentForm
              content={
                content as import("@/lib/cavenderCommitmentPageContent").CavenderCommitmentPageContent
              }
              onChange={setContent}
            />
          ) : slug === "value-your-trade" ? (
            <ValueYourTradeContentForm
              content={
                content as import("@/lib/valueYourTradePageContent").ValueYourTradePageContent
              }
              onChange={setContent}
            />
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveContent()}
              className={`${btnPrimaryMd} disabled:opacity-60`}
            >
              {saving ? "Saving…" : "Save page content"}
            </button>
            {saved ? (
              <span className="text-sm text-emerald-700">Saved. Refresh the live page to verify.</span>
            ) : null}
          </div>
        </>
      )}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
