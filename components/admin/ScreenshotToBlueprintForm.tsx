"use client";

import { useRef, useState } from "react";
import { slugifyBlueprintSlug } from "@/lib/cmsPageBlueprint";
import type { PageBlueprint } from "@/lib/cmsPageBlueprint";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface ScreenshotToBlueprintFormProps {
  openaiConfigured: boolean;
  onBlueprintGenerated: (blueprint: PageBlueprint, warnings: string[]) => void;
}

export function ScreenshotToBlueprintForm({
  openaiConfigured,
  onBlueprintGenerated,
}: ScreenshotToBlueprintFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [tone, setTone] = useState("");
  const [sectionNotes, setSectionNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!next) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
  }

  function onTitleChange(value: string) {
    setPageTitle(value);
    if (!slugTouched && value.trim()) {
      setSlug(slugifyBlueprintSlug(value));
    }
  }

  async function generateBlueprint() {
    if (!file) {
      setError("Upload a screenshot first");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("screenshot", file);
      if (pageTitle.trim()) form.append("pageTitle", pageTitle.trim());
      if (slug.trim()) form.append("slug", slugifyBlueprintSlug(slug));
      if (tone.trim()) form.append("tone", tone.trim());
      if (sectionNotes.trim()) form.append("sectionNotes", sectionNotes.trim());

      const res = await fetch("/api/admin/page-blueprints/from-screenshot", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = (await res.json()) as {
        blueprint?: PageBlueprint;
        warnings?: string[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Screenshot analysis failed");
      if (!data.blueprint) throw new Error("No blueprint returned");
      onBlueprintGenerated(data.blueprint, data.warnings ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Screenshot analysis failed");
    } finally {
      setGenerating(false);
    }
  }

  if (!openaiConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <p className="font-medium">OPENAI_API_KEY not configured</p>
        <p className="mt-1">
          Add <code className="rounded bg-white/80 px-1">OPENAI_API_KEY</code> to{" "}
          <code className="rounded bg-white/80 px-1">.env.local</code> and restart the dev
          server to enable Screenshot to Blueprint. You can still paste blueprint JSON
          manually in the Import tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-[var(--muted)]">
          Screenshot (PNG, JPEG, WebP, GIF — max 10 MB)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onFileChange}
          className="mt-2 block w-full text-sm"
        />
        {previewUrl ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-[var(--line)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Screenshot preview"
              className="max-h-72 w-full object-contain bg-[var(--cream)]"
            />
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-[var(--muted)]">
            Desired page title (optional)
          </span>
          <input
            value={pageTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
            placeholder="About Cavender"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">Slug (optional)</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            onBlur={() => setSlug(slugifyBlueprintSlug(slug))}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm font-mono"
            placeholder="about-us"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">Tone (optional)</span>
          <input
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
            placeholder="Professional, warm, Texas family-owned"
          />
        </label>
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-[var(--muted)]">
            Sections to keep or remove (optional)
          </span>
          <textarea
            rows={3}
            value={sectionNotes}
            onChange={(e) => setSectionNotes(e.target.value)}
            className="w-full rounded-xl border border-[var(--line)] px-4 py-2.5 text-sm"
            placeholder="Keep hero and FAQ; skip inventory rail; use form at bottom only."
          />
        </label>
      </div>

      <p className="text-xs text-[var(--muted)]">
        AI maps the screenshot to supported CMS section types only. Output is validated,
        sanitized, and saved as a draft — never auto-published.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={generating || !file}
          onClick={generateBlueprint}
          className={`${btnPrimaryMd} disabled:opacity-60`}
        >
          {generating ? "Analyzing screenshot…" : "Generate blueprint"}
        </button>
        {file ? (
          <button
            type="button"
            className={btnSecondaryMd}
            onClick={() => {
              setFile(null);
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            Clear image
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
