import {
  LOCATION_IMAGE_POOL,
  LOCATION_MAP_POSITIONS,
} from "@/lib/dealershipImagery";
import {
  SERVICE_LOCATION_FALLBACKS,
  type ServiceLocationFallback,
} from "@/lib/serviceSchedulingFallback";
import type { DealershipCmsEntry, DealershipDepartmentFields } from "@/lib/dealershipDirectoryTypes";

function splitAddress(address: string): { line1: string; line2: string } {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 2) {
    return { line1: address, line2: "" };
  }
  return {
    line1: parts.slice(0, 2).join(", "),
    line2: parts.slice(2).join(", "),
  };
}

function siteOrigin(url: string | undefined): string | null {
  const raw = url?.trim();
  if (!raw) return null;
  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`).origin;
  } catch {
    return null;
  }
}

function departmentDefaults(
  entry: ServiceLocationFallback,
  kind: "sales" | "service" | "parts",
): DealershipDepartmentFields {
  const origin = siteOrigin(entry.serviceScheduleUrl);
  switch (kind) {
    case "sales":
      return {
        phone: "",
        ctaLabel: "Shop inventory",
        ctaUrl: origin ? `${origin}/searchnew.htm` : "",
      };
    case "service":
      return {
        phone: entry.servicePhone ?? "",
        ctaLabel: "Schedule service",
        ctaUrl: entry.serviceScheduleUrl ?? "",
      };
    case "parts":
      return {
        phone: "",
        ctaLabel: "Order parts",
        ctaUrl: origin ? `${origin}/parts.htm` : "",
      };
  }
}

function fallbackToCmsEntry(
  entry: ServiceLocationFallback,
  index: number,
): DealershipCmsEntry {
  const { line1, line2 } = splitAddress(entry.address);
  const mapPos = LOCATION_MAP_POSITIONS[index] ?? LOCATION_MAP_POSITIONS[0];
  const scheduleUrl = entry.serviceScheduleUrl?.trim() ?? "";

  return {
    id: entry.nameIncludes.replace(/\s+/g, "-"),
    nameKey: entry.nameIncludes,
    storeName: entry.storeName,
    imageUrl: LOCATION_IMAGE_POOL[index % LOCATION_IMAGE_POOL.length],
    addressLine1: line1,
    addressLine2: line2,
    viewUrl: scheduleUrl,
    viewCtaLabel: "View location",
    mapTop: mapPos.top,
    mapLeft: mapPos.left,
    showOnInset: Boolean(mapPos.showOnInset || entry.address.toLowerCase().includes("rockwall")),
    sales: departmentDefaults(entry, "sales"),
    service: departmentDefaults(entry, "service"),
    parts: departmentDefaults(entry, "parts"),
  };
}

export const DEFAULT_DEALERSHIP_DIRECTORY: DealershipCmsEntry[] =
  SERVICE_LOCATION_FALLBACKS.map(fallbackToCmsEntry);
