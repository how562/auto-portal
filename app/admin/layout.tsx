import Link from "next/link";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { isAdminProtectionEnabled } from "@/lib/adminAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
 const isProtected = isAdminProtectionEnabled();

 return (
 <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
 <header className="border-b border-[var(--line)] bg-white">
 <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
 <Link href="/admin/pages" className="text-sm font-semibold tracking-tight">
 CMS Admin
 </Link>
 <nav className="flex flex-wrap gap-4 text-sm font-medium text-[var(--muted)]">
 <Link href="/admin/pages" className="hover:text-[var(--ink)]">
 Pages
 </Link>
 <Link href="/admin/inventory" className="hover:text-[var(--ink)]">
 Inventory
 </Link>
 <Link href="/admin/media" className="hover:text-[var(--ink)]">
 Media
 </Link>
 <Link href="/" className="hover:text-[var(--ink)]">
 View site
 </Link>
 </nav>
 </div>
 {!isProtected ? (
 <p className="border-t border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs text-amber-900">
 Admin routes are open — set <code>CMS_ADMIN_SECRET</code> in production.
 </p>
 ) : null}
 </header>
 <main className="mx-auto max-w-6xl px-6 py-10">
 <AdminSetupNotice />
 {children}
 </main>
 </div>
 );
}
