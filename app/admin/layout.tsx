import { AdminChrome } from "@/components/admin/AdminChrome";
import { isAdminProtectionEnabled } from "@/lib/adminAuthConfig";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminChrome isProtectionEnabled={isAdminProtectionEnabled()}>
      {children}
    </AdminChrome>
  );
}
