import Link from "next/link";
import { listAllSitePages } from "@/lib/cmsAdmin";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export default async function AdminPagesPage() {
 const configured = isSupabaseAdminConfigured();
 const pages = configured ? await listAllSitePages() : [];

 return (
 <div className="space-y-8">
 <div>
 <h1 className="text-2xl font-semibold tracking-tight">Site pages</h1>
 <p className="mt-1 text-sm text-[var(--muted)]">
 Edit sections and upload images. SQL and manual URLs still work as fallbacks.
 </p>
 </div>

 {!configured ? (
 <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
 Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to load and save CMS data from the admin UI.
 </p>
 ) : null}

 {pages.length === 0 ? (
 <p className="rounded-2xl border border-dashed border-[var(--line-dark)] px-6 py-12 text-center text-sm text-[var(--muted)]">
 {configured
 ? "No site_pages rows yet. Create pages in Supabase (e.g. slug home) to edit them here."
 : "Configure Supabase admin credentials to list pages."}
 </p>
 ) : (
 <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
 {pages.map((page) => (
 <li key={page.id}>
 <Link
 href={`/admin/pages/${page.id}`}
 className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 transition hover:bg-[var(--cream-dark)]"
 >
 <span className="font-medium">{page.title || page.slug}</span>
 <span className="text-sm text-[var(--muted)]">
 /{page.slug} · {page.status}
 </span>
 </Link>
 </li>
 ))}
 </ul>
 )}
 </div>
 );
}
