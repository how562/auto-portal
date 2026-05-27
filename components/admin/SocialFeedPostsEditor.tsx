"use client";

import { CmsImageField } from "@/components/admin/CmsImageField";
import type { SocialFeedBackupPost } from "@/lib/socialFeedTypes";
import type { SocialPlatform } from "@/lib/socialFeedPlaceholder";
import { btnSecondaryMd } from "@/lib/buttonClasses";

interface SocialFeedPostsEditorProps {
  posts: SocialFeedBackupPost[];
  onChange: (posts: SocialFeedBackupPost[]) => void;
}

function newPostId(): string {
  return `social-${Date.now().toString(36)}`;
}

export function SocialFeedPostsEditor({ posts, onChange }: SocialFeedPostsEditorProps) {
  function update(index: number, patch: Partial<SocialFeedBackupPost>) {
    onChange(posts.map((post, i) => (i === index ? { ...post, ...patch } : post)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= posts.length) return;
    const next = [...posts];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(
      next.map((post, i) => ({
        ...post,
        sort_order: (i + 1) * 10,
      })),
    );
  }

  function remove(index: number) {
    onChange(
      posts
        .filter((_, i) => i !== index)
        .map((post, i) => ({ ...post, sort_order: (i + 1) * 10 })),
    );
  }

  function addPost() {
    onChange([
      ...posts,
      {
        id: newPostId(),
        platform: "facebook",
        image_url: "",
        caption: "",
        date_label: "",
        href: "https://www.facebook.com/CavenderAutoG",
        page_name: "Cavender Auto Group",
        is_active: true,
        sort_order: (posts.length + 1) * 10,
      },
    ]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
          Backup posts
        </p>
        <p className="text-xs text-[var(--muted)]">
          Active posts appear in carousel order. Hide or reorder to rotate stories.
        </p>
      </div>

      {posts.map((post, index) => (
        <article
          key={post.id}
          className={`space-y-3 rounded-xl border p-4 ${
            post.is_active
              ? "border-[var(--line)] bg-[var(--cream)]/40"
              : "border-dashed border-[var(--line)] bg-white opacity-70"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-[var(--ink)]">Post {index + 1}</p>
              {!post.is_active ? (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                  Hidden
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="rounded border border-[var(--line-dark)] px-2 py-1 text-xs disabled:opacity-40"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === posts.length - 1}
                onClick={() => move(index, 1)}
                className="rounded border border-[var(--line-dark)] px-2 py-1 text-xs disabled:opacity-40"
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => update(index, { is_active: !post.is_active })}
                className={`${btnSecondaryMd} px-2 py-1 text-xs`}
              >
                {post.is_active ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className={`${btnSecondaryMd} px-2 py-1 text-xs text-red-700`}
              >
                Remove
              </button>
            </div>
          </div>

          <CmsImageField
            label="Image"
            value={post.image_url}
            onChange={(url) => update(index, { image_url: url })}
            hint="Recommended: 4:5 portrait, at least 800px wide."
          />

          <label className="block space-y-1">
            <span className="text-xs text-[var(--muted)]">Caption</span>
            <textarea
              rows={3}
              value={post.caption}
              onChange={(e) => update(index, { caption: e.target.value })}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs text-[var(--muted)]">Date label</span>
              <input
                value={post.date_label}
                onChange={(e) => update(index, { date_label: e.target.value })}
                placeholder="Mar 18, 2026"
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-[var(--muted)]">Platform</span>
              <select
                value={post.platform}
                onChange={(e) =>
                  update(index, { platform: e.target.value as SocialPlatform })
                }
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              >
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs text-[var(--muted)]">Link URL</span>
              <input
                value={post.href}
                onChange={(e) => update(index, { href: e.target.value })}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-[var(--muted)]">Page / account name</span>
              <input
                value={post.page_name}
                onChange={(e) => update(index, { page_name: e.target.value })}
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              />
            </label>
          </div>
        </article>
      ))}

      <button type="button" className={btnSecondaryMd} onClick={addPost}>
        Add post
      </button>
    </div>
  );
}
