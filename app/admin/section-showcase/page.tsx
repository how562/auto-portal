import Link from "next/link";

export default function AdminSectionShowcaseStubPage() {
  return (
    <div className="space-y-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8">
      <h1 className="text-xl font-semibold text-amber-950">Section showcase</h1>
      <p className="text-sm leading-relaxed text-amber-900">
        Open the showcase in <code className="rounded bg-white/80 px-1">auto-portal</code> via{" "}
        <code className="rounded bg-white/80 px-1">npm run dev</code> at{" "}
        <code className="rounded bg-white/80 px-1">/admin/section-showcase</code>.
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
