"use client";

import { usePathname } from "next/navigation";
import { AdminSetupNotice } from "@/components/admin/AdminSetupNotice";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { isAdminProtectionEnabled } from "@/lib/adminAuth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/admin/login");

  if (isLogin) {
    return (
      <div className="min-h-screen bg-[var(--cream)] text-[var(--ink)]">
        {children}
      </div>
    );
  }

  const isProtected = isAdminProtectionEnabled();

  return (
    <div className="flex min-h-screen bg-[var(--cream)] text-[var(--ink)]">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {!isProtected ? (
          <p className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-xs text-amber-900">
            Admin routes are open — set <code>CMS_ADMIN_SECRET</code> in production.
          </p>
        ) : null}
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
          <AdminSetupNotice />
          {children}
        </main>
      </div>
    </div>
  );
}
