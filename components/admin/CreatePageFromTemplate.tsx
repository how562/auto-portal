"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PAGE_TEMPLATES,
  type PageTemplateId,
} from "@/lib/cmsPageTemplates";
import { slugifyBlueprintSlug } from "@/lib/cmsPageBlueprint";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface CreatePageFromTemplateProps {
  onCancel?: () => void;
}

export function CreatePageFromTemplate({ onCancel }: CreatePageFromTemplateProps) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<PageTemplateId | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [metaDescription, setMetaDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = PAGE_TEMPLATES.find((t) => t.id === templateId);

  useEffect(() => {
    if (!slugTouched && title.trim()) {
      setSlug(slugifyBlueprintSlug(title));
    }
  }, [title, slugTouched]);

  useEffect(() => {
    if (selected && !title.trim()) {
      setTitle(selected.label);
      if (!slugTouched) {
        setSlug(slugifyBlueprintSlug(selected.suggestedSlug));
      }
    }
  }, [selected, slugTouched, title]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!templateId) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/site-pages/from-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          templateId,
          title: title.trim(),
          slug: slug.trim() || undefined,
          meta_description: metaDescription.trim() || null,
        }),
      });
      const data = (await res.json()) as { page?: { id: string }; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Create failed");
      if (data.page?.id) {
        router.push(`/admin/pages/${data.page.id}`);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Create page from template
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Pick a starter layout. The page is saved as a draft with pre-built sections.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PAGE_TEMPLATES.map((template) => {
          const active = templateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setTemplateId(template.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-[var(--ink)] bg-[var(--cream)] ring-1 ring-[var(--ink)]"
                  : "border-[var(--line)] bg-white hover:border-[var(--line-dark)]"
              }`}
            >
              <p className="font-medium">{template.label}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{template.description}</p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {template.sections.length} sections
              </p>
            </button>
          );
        })}
      </div>

      {templateId ? (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6"
        >
          <h3 className="font-medium">{selected?.label}</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-[var(--muted)]">Title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs font-medium text-[var(--muted)]">Slug</span>
              <input
                required
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                onBlur={() => setSlug(slugifyBlueprintSlug(slug))}
                className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-mono"
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
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Creates as <strong>draft</strong> with starter sections, then opens the page builder.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={creating || !title.trim()}
              className={`${btnPrimaryMd} disabled:opacity-60`}
            >
              {creating ? "Creating…" : "Create draft page"}
            </button>
            {onCancel ? (
              <button type="button" className={btnSecondaryMd} onClick={onCancel}>
                Cancel
              </button>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </div>
        </form>
      ) : (
        <p className="text-sm text-[var(--muted)]">Select a template to continue.</p>
      )}
    </div>
  );
}
