export function parseSettings(
  settings: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (!settings || typeof settings !== "object") return {};
  return settings;
}

export function settingString(
  settings: Record<string, unknown>,
  key: string,
  fallback = "",
): string {
  const v = settings[key];
  return typeof v === "string" ? v : fallback;
}

export function settingNumber(
  settings: Record<string, unknown>,
  key: string,
  fallback?: number,
): number | undefined {
  const v = settings[key];
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return fallback;
}

export function settingBool(
  settings: Record<string, unknown>,
  key: string,
): boolean | undefined {
  const v = settings[key];
  if (typeof v === "boolean") return v;
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return undefined;
}

export function settingItems<T extends Record<string, unknown>>(
  settings: Record<string, unknown>,
  key: string,
): T[] {
  const v = settings[key];
  if (!Array.isArray(v)) return [];
  return v.filter((item): item is T => item !== null && typeof item === "object");
}
