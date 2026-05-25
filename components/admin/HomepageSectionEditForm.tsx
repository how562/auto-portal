"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  HomepageSectionAdminRow,
  HomepageSectionType,
} from "@/lib/homepageSectionsAdmin";

interface CollectionOption {
  id: string;
  name: string;
}

interface HomepageSectionEditFormProps {
  section: HomepageSectionAdminRow;
  collections: CollectionOption[];
}

export function HomepageSectionEditForm({
  section: initial,
  collections,
}: HomepageSectionEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title ?? "");
  const [titleEs, setTitleEs] = useState(initial.title_es ?? "");
  const [subtitle, setSubtitle] = useState(initial.subtitle ?? "");
  const [subtitleEs, setSubtitleEs] = useState(initial.subtitle_es ?? "");
  const [sectionType, setSectionType] = useState<HomepageSectionType>(
    initial.section_type,
  );
  const [collectionId, setCollectionId] = useState(
    initial.collection_id ?? "",
  );
  const [sortOrder, setSortOrder] = useState(initial.sort_order);
  const [isActive, setIsActive] = useState(initial.is_active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/homepage-sections", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: initial.id,
        updates: {
          title: title || null,
          title_es: titleEs || null,
          subtitle: subtitle || null,
          subtitle_es: subtitleEs || null,
          section_type: sectionType,
          collection_id:
            sectionType === "collection" && collectionId ? collectionId : null,
          sort_order: sortOrder,
          is_active: isActive,
        },
      }),
    });

    const data = (await res.json()) as { error?: string };
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }

    router.push("/admin/homepage-sections");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/homepage-sections"
        className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
      >
        ← Back to homepage sections
      </Link>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="max-w-xl space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
        <label className="block text-xs font-medium text-[var(--muted)]">
          Title (EN)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-[var(--muted)]">
          Title (ES)
          <input
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-[var(--muted)]">
          Subtitle (EN)
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-[var(--muted)]">
          Subtitle (ES)
          <input
            value={subtitleEs}
            onChange={(e) => setSubtitleEs(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-[var(--muted)]">
          Section type
          <select
            value={sectionType}
            onChange={(e) =>
              setSectionType(e.target.value as HomepageSectionType)
            }
            className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          >
            <option value="collection">Collection</option>
            <option value="banner">Banner</option>
            <option value="static">Static</option>
          </select>
        </label>
        {sectionType === "collection" ? (
          <label className="block text-xs font-medium text-[var(--muted)]">
            Collection
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            >
              <option value="">Select collection…</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-xs font-medium text-[var(--muted)]">
          Sort order
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Visible on homepage (when rails are enabled)
        </label>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
