"use client";

import { useRouter } from "next/navigation";

interface CmsDebugSlugFormProps {
  slug: string;
}

export function CmsDebugSlugForm({ slug }: CmsDebugSlugFormProps) {
  const router = useRouter();

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const next = String(fd.get("slug") ?? "").trim() || "about-us";
        router.push(`/admin/debug-cms?slug=${encodeURIComponent(next)}`);
      }}
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-[var(--ink)]">Page slug</span>
        <input
          name="slug"
          type="text"
          defaultValue={slug}
          className="min-w-[12rem] rounded-lg border border-[var(--line)] bg-white px-3 py-2 font-mono text-sm"
          placeholder="about-us"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-medium text-white"
      >
        Load
      </button>
      <div className="flex flex-wrap gap-2 text-sm">
        {(["about-us", "cms-demo"] as const).map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() =>
              router.push(`/admin/debug-cms?slug=${encodeURIComponent(preset)}`)
            }
            className="rounded-lg border border-[var(--line)] bg-white px-3 py-2 font-mono text-[var(--muted)] hover:text-[var(--ink)]"
          >
            {preset}
          </button>
        ))}
      </div>
    </form>
  );
}
