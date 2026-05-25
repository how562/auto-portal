/** Cookie/header admin auth helpers safe for middleware and shared server code (no next/headers). */

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
