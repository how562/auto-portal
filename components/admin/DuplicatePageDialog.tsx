"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { slugifyBlueprintSlug } from "@/lib/cmsPageBlueprint";
import type { SitePage } from "@/lib/cmsTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface DuplicatePageDialogProps {
  page: SitePage;
  onClose: () => void;
}

export function DuplicatePageDialog({ page, onClose }: DuplicatePageDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState(`${page.title} (copy)`);
  const [slug, setSlug] = useState(`${page.slug}-copy`);
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(`${page.title} (copy)`);
    setSlug(`${page.slug}-copy`);
  }, [page]);

  async function handleDuplicate(e: React.FormEvent) {
    e.preventDefault();
    setDuplicating(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/site-pages/${page.id}/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          slug: slugifyBlueprintSlug(slug.trim() || title),
        }),
      });
      const data = (await res.json()) as { page?: { id: string }; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Duplicate failed");
      if (data.page?.id) {
        router.push(`/admin/pages/${data.page.id}`);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Duplicate failed");
    } finally {
      setDuplicating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicate-page-title"
    >
      <form
        onSubmit={handleDuplicate}
        className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-6 shadow-lg"
      >
        <h2 id="duplicate-page-title" className="text-lg font-semibold">
          Duplicate page
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Copies all sections, order, settings, and content. New page is a draft.
        </p>
        <div className="mt-4 space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--muted)]">New title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-[var(--muted)]">New slug</span>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              onBlur={() => setSlug(slugifyBlueprintSlug(slug))}
              className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-mono"
            />
          </label>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={duplicating}
            className={`${btnPrimaryMd} disabled:opacity-60`}
          >
            {duplicating ? "Duplicating…" : "Duplicate as draft"}
          </button>
          <button type="button" className={btnSecondaryMd} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
