import type { Vehicle } from "@/lib/types";

const INVALID_URL_VALUES = new Set([
  "",
  "null",
  "undefined",
  "none",
  "n/a",
  "na",
  "tbd",
  "pending",
  "-",
  "—",
]);

const LUXURY_MAKES = [
  "cadillac",
  "bmw",
  "mercedes",
  "mercedes-benz",
  "lexus",
  "audi",
  "porsche",
  "lincoln",
  "genesis",
  "acura",
  "infiniti",
  "jaguar",
  "land rover",
  "volvo",
];

export type PlaceholderTheme = "truck" | "suv" | "sedan" | "luxury" | "default";

function normalizeImageUrl(raw: unknown): string | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!trimmed || INVALID_URL_VALUES.has(trimmed.toLowerCase())) {
    return null;
  }
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("//")
  ) {
    return null;
  }
  return trimmed;
}

/**
 * Resolve the best image for a vehicle:
 *   1. `primary_image_url`
 *   2. first entry of `image_urls`
 *   3. `null` (caller renders the placeholder)
 */
export function getVehicleImageUrl(
  vehicle: Pick<Vehicle, "primary_image_url" | "image_urls">,
): string | null {
  const primary = normalizeImageUrl(vehicle.primary_image_url);
  if (primary) return primary;

  const list = vehicle.image_urls;
  if (Array.isArray(list)) {
    for (const candidate of list) {
      const normalized = normalizeImageUrl(candidate);
      if (normalized) return normalized;
    }
  }
  return null;
}

/** Returns a valid image URL, or null when a placeholder should be shown. */
export function getVehicleImage(
  vehicle: Pick<Vehicle, "primary_image_url" | "image_urls">,
): string | null {
  return getVehicleImageUrl(vehicle);
}

function normalizeHaystack(
  bodyStyle?: string | null,
  make?: string | null,
  model?: string | null,
): string {
  return [bodyStyle, make, model].filter(Boolean).join(" ").toLowerCase();
}

export function getPlaceholderTheme(
  bodyStyle?: string | null,
  make?: string | null,
  model?: string | null,
): PlaceholderTheme {
  const text = normalizeHaystack(bodyStyle, make, model);
  const makeLower = (make ?? "").toLowerCase();

  if (LUXURY_MAKES.some((m) => makeLower.includes(m))) {
    return "luxury";
  }

  if (
    text.includes("truck") ||
    text.includes("pickup") ||
    text.includes("sierra") ||
    text.includes("f-150") ||
    text.includes("silverado")
  ) {
    return "truck";
  }

  if (
    text.includes("suv") ||
    text.includes("crossover") ||
    text.includes("van") ||
    text.includes("minivan") ||
    text.includes("yukon") ||
    text.includes("tahoe") ||
    text.includes("acadia")
  ) {
    return "suv";
  }

  if (
    text.includes("sedan") ||
    text.includes("coupe") ||
    text.includes("convertible")
  ) {
    return "sedan";
  }

  return "default";
}

export function getPlaceholderLabel(
  year?: number | null,
  make?: string | null,
  model?: string | null,
): string {
  const parts = [year, make, model].filter(
    (p) => p !== null && p !== undefined && String(p).trim() !== "",
  );
  return parts.length > 0 ? parts.join(" ") : "Vehicle";
}
