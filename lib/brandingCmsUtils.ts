/** Helpers for brand-reference CMS (not global theme tokens). */

export function hexToRgb(hex: string): string | null {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized) && !/^[0-9a-fA-F]{3}$/.test(normalized)) {
    return null;
  }
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

export function normalizeHex(hex: string): string {
  const trimmed = hex.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function isValidBrandingResource(value: string): value is import("./brandingCmsTypes").BrandingCmsResource {
  return (
    value === "logos" ||
    value === "colors" ||
    value === "typography" ||
    value === "messaging" ||
    value === "disclaimers" ||
    value === "dealer-references"
  );
}
