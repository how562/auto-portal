"use client";

import { usePathname } from "next/navigation";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { AppSidebar } from "@/components/admin/AppSidebar";

interface AdminShellProps {
  children: React.ReactNode;
  isProtectionEnabled: boolean;
}

export function AdminShell({
  children,
  isProtectionEnabled,
}: AdminShellProps) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/admin/login");
  const isWideCatalog =
    pathname.startsWith("/admin/section-showcase") ||
    pathname.startsWith("/admin/section-library") ||
    pathname.startsWith("/admin/pages");

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {!isProtectionEnabled ? (
          <p className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs text-amber-900">
            Admin routes are open — set <code>CMS_ADMIN_SECRET</code> in production.
          </p>
        ) : null}
        <main
          className={`mx-auto w-full flex-1 px-4 py-8 sm:px-6 sm:py-10 ${
            isWideCatalog ? "max-w-[92rem]" : "max-w-5xl"
          }`}
        >
          <AdminSetupNotice />
          {children}
        </main>
      </div>
    </div>
  );
}
