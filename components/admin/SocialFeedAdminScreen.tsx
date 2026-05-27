"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { SocialFeedPostsEditor } from "@/components/admin/SocialFeedPostsEditor";
import type { SocialFeedAdminPayload, SocialFeedCmsContent } from "@/lib/socialFeedTypes";
import { btnPrimaryMd } from "@/lib/buttonClasses";

interface SocialFeedAdminScreenProps {
  initial: SocialFeedAdminPayload;
}

export function SocialFeedAdminScreen({ initial }: SocialFeedAdminScreenProps) {
  const [content, setContent] = useState<SocialFeedCmsContent>(initial.content);
  const [liveModeEnabled, setLiveModeEnabled] = useState(initial.liveModeEnabled);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(content) !== JSON.stringify(initial.content);

  const save = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/social-feed", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = (await res.json()) as SocialFeedAdminPayload & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setContent(data.content);
      setLiveModeEnabled(data.liveModeEnabled);
      setMessage("Saved — backup posts will show when live Meta feed is unavailable.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }, [content]);

  const activeCount = content.posts.filter((p) => p.is_active).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/homepage"
            className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)]"
          >
            ← Homepage
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            Community social feed
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Two sources: a live Meta feed (Facebook / Instagram API) when enabled, and editable
            backup posts that always stay available for rotation and manual curation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/#social-feed"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-[var(--line-dark)] px-3 py-1.5 text-xs font-semibold"
          >
            View on homepage
          </Link>
          <button
            type="button"
            disabled={saving || !dirty}
            onClick={() => void save()}
            className={`${btnPrimaryMd} disabled:opacity-50`}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {message ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--line)] bg-white p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            Part 1 — Live feed
          </p>
          <h2 className="mt-2 text-lg font-semibold">Meta API (Facebook / Instagram)</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            When live mode is on and the Graph API returns posts, those replace the backup carousel
            automatically. Until credentials are connected, the site uses backup posts below.
          </p>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
              <dt className="text-[var(--muted)]">Mode</dt>
              <dd className="font-medium">
                {liveModeEnabled ? (
                  <span className="text-emerald-700">Live (env enabled)</span>
                ) : (
                  <span className="text-amber-800">Backup only</span>
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
              <dt className="text-[var(--muted)]">Env flag</dt>
              <dd className="font-mono text-xs">NEXT_PUBLIC_SOCIAL_FEED_MODE=live</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Fallback</dt>
              <dd className="text-right font-medium">Uses backup posts when API is off or empty</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/30 p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
            Part 2 — Backup feed
          </p>
          <h2 className="mt-2 text-lg font-semibold">Curated posts</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {activeCount} of {content.posts.length} posts active in the carousel. Hide posts to
            rotate them off the homepage, reorder to change sequence, or add new stories anytime.
          </p>
        </section>
      </div>

      <section className="rounded-xl border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="text-base font-semibold">Section header</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block space-y-1">
            <span className="text-xs text-[var(--muted)]">Eyebrow</span>
            <input
              value={content.eyebrow}
              onChange={(e) => setContent((c) => ({ ...c, eyebrow: e.target.value }))}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs text-[var(--muted)]">Headline</span>
            <input
              value={content.headline}
              onChange={(e) => setContent((c) => ({ ...c, headline: e.target.value }))}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </label>
          <label className="block space-y-1 sm:col-span-3">
            <span className="text-xs text-[var(--muted)]">Description</span>
            <textarea
              rows={2}
              value={content.description}
              onChange={(e) => setContent((c) => ({ ...c, description: e.target.value }))}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-[var(--line)] bg-white p-5 sm:p-6">
        <SocialFeedPostsEditor
          posts={content.posts}
          onChange={(posts) => setContent((c) => ({ ...c, posts }))}
        />
      </section>
    </div>
  );
}
