import { AdminDashboardScreen } from "@/components/admin/AdminDashboardScreen";
import { getAdminWorkspaceSnapshot } from "@/lib/adminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const snapshot = await getAdminWorkspaceSnapshot();
  return <AdminDashboardScreen snapshot={snapshot} />;
}
