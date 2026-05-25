import { AdminShell } from "@/components/admin/AdminShell";

interface AdminChromeProps {
  children: React.ReactNode;
  isProtectionEnabled: boolean;
}

export function AdminChrome({
  children,
  isProtectionEnabled,
}: AdminChromeProps) {
  return (
    <AdminShell isProtectionEnabled={isProtectionEnabled}>
      {children}
    </AdminShell>
  );
}
