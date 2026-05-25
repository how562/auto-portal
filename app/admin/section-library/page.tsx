import Link from "next/link";

/**
 * Stub route when the repo root Next app is run instead of auto-portal.
 * Full section library UI lives in auto-portal — use `npm run dev` from repo root
 * (defaults to auto-portal) or `npm run dev` inside auto-portal/.
 */
export default function SectionLibraryStubPage() {
  return (
    <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8">
      <h1 className="text-xl font-semibold text-amber-950">Section library</h1>
      <p className="text-sm leading-relaxed text-amber-900">
        The visual section library and page builder run in the{" "}
        <code className="rounded bg-white/80 px-1">auto-portal</code> app. Start the dev
        server with <code className="rounded bg-white/80 px-1">npm run dev</code> from the
        repository root (recommended) or <code className="rounded bg-white/80 px-1">cd auto-portal &amp;&amp; npm run dev</code>.
      </p>
      <Link
        href="/admin/pages"
        className="inline-flex text-sm font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
      >
        ← Back to pages
      </Link>
    </div>
  );
}
