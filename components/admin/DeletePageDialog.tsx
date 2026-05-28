"use client";

import { useState } from "react";
import type { AdminSitePageListItem } from "@/lib/cmsTypes";
import { getSitePageDeletePolicy } from "@/lib/sitePageDeletePolicy";
import {
  getSitePageDisplayTitle,
  getSitePageLiveHref,
} from "@/lib/sitePagesListUtils";
import { btnSecondaryMd } from "@/lib/buttonClasses";

interface DeletePageDialogProps {
  page: AdminSitePageListItem;
  onClose: () => void;
  onDeleted: (pageId: string) => void;
}

export function DeletePageDialog({ page, onClose, onDeleted }: DeletePageDialogProps) {
  const policy = getSitePageDeletePolicy(page);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPublished = policy.canDelete && policy.severity === "published";
  const slugMatches = confirmSlug.trim() === page.slug;
  const canSubmit = policy.canDelete && (!isPublished || slugMatches);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site-pages/${page.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      onDeleted(page.id);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const displayTitle = getSitePageDisplayTitle(page);
  const path = page.slug === "home" ? "/" : getSitePageLiveHref(page);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-page-title"
      onClick={onClose}
    >
      <form
        onSubmit={(e) => void handleDelete(e)}
        className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="delete-page-title" className="text-lg font-semibold text-[var(--ink)]">
          Delete page
        </h2>

        {!policy.canDelete ? (
          <>
            <p className="mt-2 text-sm text-[var(--muted)]">{policy.reason}</p>
            <div className="mt-5 flex justify-end">
              <button type="button" className={btnSecondaryMd} onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {isPublished ? (
                <>
                  This will permanently remove{" "}
                  <strong className="font-semibold text-[var(--ink)]">{displayTitle}</strong>{" "}
                  from the site. The public URL{" "}
                  <span className="font-mono text-[var(--ink)]">{path}</span> will stop working.
                </>
              ) : (
                <>
                  Permanently delete draft{" "}
                  <strong className="font-semibold text-[var(--ink)]">{displayTitle}</strong> (
                  <span className="font-mono">{page.slug}</span>) and all of its sections?
                </>
              )}
            </p>

            {isPublished ? (
              <label className="mt-4 block space-y-1">
                <span className="text-xs font-medium text-[var(--muted)]">
                  Type <span className="font-mono text-[var(--ink)]">{page.slug}</span> to confirm
                </span>
                <input
                  value={confirmSlug}
                  onChange={(e) => setConfirmSlug(e.target.value)}
                  className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 font-mono text-sm"
                  autoComplete="off"
                  placeholder={page.slug}
                />
              </label>
            ) : null}

            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={deleting || !canSubmit}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
              <button type="button" className={btnSecondaryMd} onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
