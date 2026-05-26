"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AdminNavItem {
  title: string;
  href: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard" },
  { title: "Pages", href: "/admin/pages" },
  { title: "Page blueprints", href: "/admin/page-blueprints" },
  { title: "Navigation", href: "/admin/navigation" },
  { title: "Section showcase", href: "/admin/section-showcase" },
  { title: "Branding", href: "/admin/branding" },
  { title: "Homepage", href: "/admin/homepage" },
  { title: "Collections", href: "/admin/collections" },
  { title: "Notes", href: "/admin/notes" },
  { title: "Inventory", href: "/admin/inventory" },
  { title: "Media", href: "/admin/media" },
  { title: "Math Box", href: "/admin/mathbox-settings" },
  { title: "Text Settings", href: "/admin/text-settings" },
  { title: "Smart Match", href: "/admin/smart-match-rules" },
  { title: "Feed Mapping", href: "/admin/feed-mapping" },
  { title: "Feed Imports", href: "/admin/feeds" },
];

function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--line)] bg-white">
      <div className="border-b border-[var(--line)] px-4 py-5">
        <Link
          href="/admin/dashboard"
          className="text-sm font-semibold tracking-tight text-[var(--ink)]"
        >
          CMS Admin
        </Link>
        <p className="mt-1 text-xs text-[var(--muted)]">Inventory &amp; portal</p>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[var(--cream-dark)] text-[var(--ink)]"
                  : "text-[var(--muted)] hover:bg-[var(--cream)] hover:text-[var(--ink)]"
              }`}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--line)] px-4 py-4">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--ink)]"
        >
          View site
        </Link>
      </div>
    </aside>
  );
}
