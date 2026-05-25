import "server-only";

import { cookies } from "next/headers";
import {
  CMS_ADMIN_COOKIE,
  isAdminProtectionEnabled,
  isValidAdminSecret,
} from "@/lib/adminAuthConfig";

export {
  CMS_ADMIN_COOKIE,
  getAdminSecret,
  isAdminProtectionEnabled,
  isValidAdminSecret,
  getAdminKeyFromRequest,
  isAdminRequest,
} from "@/lib/adminAuthConfig";

export async function isAdminSession(): Promise<boolean> {
  if (!isAdminProtectionEnabled()) return true;
  const cookieStore = await cookies();
  return isValidAdminSecret(cookieStore.get(CMS_ADMIN_COOKIE)?.value);
}
