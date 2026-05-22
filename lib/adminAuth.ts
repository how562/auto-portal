import { cookies } from "next/headers";

export const CMS_ADMIN_COOKIE = "cms_admin";

export function getAdminSecret(): string | undefined {
  return process.env.CMS_ADMIN_SECRET?.trim() || undefined;
}

export function isAdminProtectionEnabled(): boolean {
  return Boolean(getAdminSecret());
}

export function isValidAdminSecret(value: string | null | undefined): boolean {
  const secret = getAdminSecret();
  if (!secret) return true;
  return value === secret;
}

export async function isAdminSession(): Promise<boolean> {
  if (!isAdminProtectionEnabled()) return true;
  const cookieStore = await cookies();
  return isValidAdminSecret(cookieStore.get(CMS_ADMIN_COOKIE)?.value);
}

export function getAdminKeyFromRequest(request: Request): string | null {
  const header = request.headers.get("x-cms-admin-key");
  if (header) return header;

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${CMS_ADMIN_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function isAdminRequest(request: Request): boolean {
  return isValidAdminSecret(getAdminKeyFromRequest(request));
}
