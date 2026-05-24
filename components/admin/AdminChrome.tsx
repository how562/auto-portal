import { AdminShell } from "@/components/admin/AdminShell";

export function AdminChrome({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
