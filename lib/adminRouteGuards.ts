import { redirect } from "next/navigation";
import { isAdminProtectionEnabled, isAdminSession } from "@/lib/adminAuth";

/** App routes with dedicated segments (not CMS). */
export const DEDICATED_APP_SLUGS = new Set([
  "mathbox-settings",
  "inventory",
  "admin",
  "api",
]);

export async function requireAdminSession(nextPath: string): Promise<void> {
  if (isAdminProtectionEnabled() && !(await isAdminSession())) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
}
