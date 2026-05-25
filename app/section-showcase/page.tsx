import Link from "next/link";

/**
 * Stub when the repo root Next app is run instead of auto-portal.
 * Full showcase lives in auto-portal — use `npm run dev` from repo root.
 */
export default function SectionShowcaseStubPage() {
  return (
    <div className="portal-container py-20">
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8">
        <h1 className="text-xl font-semibold text-amber-950">Section showcase</h1>
        <p className="text-sm leading-relaxed text-amber-900">
          The ten-section layout kit runs in{" "}
          <code className="rounded bg-white/80 px-1">auto-portal</code>. Start the dev server with{" "}
          <code className="rounded bg-white/80 px-1">npm run dev</code> from the repository root,
          then open <code className="rounded bg-white/80 px-1">/section-showcase</code>.
        </p>
        <Link
          href="/"
          className="inline-flex text-sm font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
        >
          ← Home
        </Link>
      </div>
    </div>
  );
}
