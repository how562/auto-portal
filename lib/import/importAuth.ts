/** Shared secret for server-only import routes (HomeNet, etc.). */
export function getImportSecret(): string | undefined {
  return process.env.IMPORT_SECRET?.trim() || undefined;
}

export function isImportAuthorized(request: Request): boolean {
  const secret = getImportSecret();
  if (!secret) return false;

  const headerSecret =
    request.headers.get("x-import-secret")?.trim() ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (headerSecret === secret) return true;

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret")?.trim();
  return querySecret === secret;
}
