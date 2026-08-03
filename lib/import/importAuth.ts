/** Shared secret for server-only import routes (HomeNet, vAuto, etc.). */
export function getImportSecret(): string | undefined {
  return process.env.IMPORT_SECRET?.trim() || undefined;
}

/**
 * Optional cron / scheduler secret. Accepted in addition to IMPORT_SECRET
 * so external cron jobs can use a dedicated credential.
 */
export function getImportCronSecret(): string | undefined {
  return (
    process.env.IMPORT_CRON_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    undefined
  );
}

function extractRequestSecret(request: Request): string | null {
  const headerSecret =
    request.headers.get("x-import-secret")?.trim() ||
    request.headers.get("x-cron-secret")?.trim() ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();

  if (headerSecret) return headerSecret;

  const url = new URL(request.url);
  return (
    url.searchParams.get("secret")?.trim() ||
    url.searchParams.get("cron_secret")?.trim() ||
    null
  );
}

/** True when the request presents IMPORT_SECRET or IMPORT_CRON_SECRET / CRON_SECRET. */
export function isImportAuthorized(request: Request): boolean {
  const provided = extractRequestSecret(request);
  if (!provided) return false;

  const importSecret = getImportSecret();
  if (importSecret && provided === importSecret) return true;

  const cronSecret = getImportCronSecret();
  if (cronSecret && provided === cronSecret) return true;

  return false;
}

/** True when at least one import auth secret is configured. */
export function isImportAuthConfigured(): boolean {
  return Boolean(getImportSecret() || getImportCronSecret());
}
