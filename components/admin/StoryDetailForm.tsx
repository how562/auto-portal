"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CmsImageField } from "@/components/admin/CmsImageField";
import {
  bodyParagraphsToText,
  slugifyStoryTitle,
  textToBodyParagraphs,
  type StoryAdminRow,
} from "@/lib/storiesAdmin";
import {
  STORY_CATEGORIES,
  STORY_CATEGORY_LABELS,
  storyHref,
} from "@/lib/storiesContent";

interface StoryDetailFormProps {
  story: StoryAdminRow;
}

function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string {
  if (!value.trim()) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

export function StoryDetailForm({ story: initial }: StoryDetailFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [category, setCategory] = useState(initial.category);
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [coverImageAlt, setCoverImageAlt] = useState(initial.coverImageAlt);
  const [author, setAuthor] = useState(initial.author);
  const [publishedAt, setPublishedAt] = useState(
    toDatetimeLocalValue(initial.publishedAt),
  );
  const [readTime, setReadTime] = useState(initial.readTime);
  const [featured, setFeatured] = useState(initial.featured);
  const [externalUrl, setExternalUrl] = useState(initial.externalUrl ?? "");
  const [status, setStatus] = useState(initial.status);
  const [bodyText, setBodyText] = useState(bodyParagraphsToText(initial.body));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/stories/${initial.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug: slug || slugifyStoryTitle(title),
        excerpt,
        category,
        cover_image: coverImage,
        cover_image_alt: coverImageAlt,
        author,
        published_at: fromDatetimeLocalValue(publishedAt),
        read_time: readTime,
        featured,
        external_url: externalUrl.trim() || null,
        status,
        body: textToBodyParagraphs(bodyText),
      }),
    });

    const data = (await res.json()) as { error?: string };
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Save failed");
      return;
    }

    router.push("/admin/stories");
    router.refresh();
  }

  const previewStory = {
    ...initial,
    slug,
    status,
    externalUrl: externalUrl.trim() || null,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/stories"
          className="text-sm text-[var(--muted)] hover:text-[var(--ink)]"
        >
          ← Back to stories
        </Link>
        {status === "published" ? (
          <a
            href={storyHref(previewStory)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline"
          >
            View on site
          </a>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Details
          </h2>

          <label className="block text-xs font-medium text-[var(--muted)]">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-medium text-[var(--muted)]">
            URL slug
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 font-mono text-sm"
            />
          </label>

          <label className="block text-xs font-medium text-[var(--muted)]">
            Excerpt
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-medium text-[var(--muted)]">
            Category
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as typeof category)
              }
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            >
              {STORY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {STORY_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-medium text-[var(--muted)]">
              Author
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-xs font-medium text-[var(--muted)]">
              Read time
              <input
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="5 min read"
                className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
              />
            </label>
          </div>

          <label className="block text-xs font-medium text-[var(--muted)]">
            Publish date
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-medium text-[var(--muted)]">
            Status
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "published")
              }
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Featured story (shown in hero on /stories)
          </label>

          <label className="block text-xs font-medium text-[var(--muted)]">
            External URL (optional — redirects instead of detail page)
            <input
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 font-mono text-sm"
            />
          </label>
        </div>

        <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Media &amp; body
          </h2>

          <CmsImageField
            label="Cover image"
            value={coverImage}
            onChange={setCoverImage}
            hint="Recommended: 1200×800 landscape."
          />

          <label className="block text-xs font-medium text-[var(--muted)]">
            Cover image alt text
            <input
              value={coverImageAlt}
              onChange={(e) => setCoverImageAlt(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-xs font-medium text-[var(--muted)]">
            Body
            <span className="mt-1 block font-normal text-[var(--muted)]">
              Separate paragraphs with a blank line.
            </span>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={14}
              className="mt-2 w-full rounded-lg border border-[var(--line-dark)] px-3 py-2 text-sm leading-relaxed"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-md bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save story"}
        </button>
        <Link
          href="/admin/stories"
          className="rounded-md border border-[var(--line-dark)] px-5 py-2.5 text-sm font-medium"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
