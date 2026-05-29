import type {
  DealershipCmsEntry,
  DealershipDepartmentContact,
  DealershipDepartmentFields,
} from "@/lib/dealershipDirectoryTypes";
import type { DealershipLocation } from "@/lib/locationsPageTypes";
import type { ServiceLocation } from "@/lib/serviceSchedulingTypes";

function toTelHref(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.length === 10 ? `tel:+1${digits}` : `tel:+${digits}`;
}

function pickString(stored: string | undefined, fallback: string): string {
  const value = stored?.trim();
  return value ? value : fallback;
}

export function findDealershipCmsEntry(
  entries: DealershipCmsEntry[] | undefined,
  location: { id: string; storeName: string },
): DealershipCmsEntry | undefined {
  if (!entries?.length) return undefined;
  return (
    entries.find((entry) => entry.id === location.id) ??
    entries.find((entry) =>
      location.storeName.toLowerCase().includes(entry.nameKey.toLowerCase()),
    )
  );
}

function buildDepartmentContact(
  key: DealershipDepartmentContact["key"],
  label: string,
  fields: DealershipDepartmentFields,
  fallbacks: { phone?: string | null; ctaLabel: string; ctaUrl?: string | null },
): DealershipDepartmentContact | null {
  const phone = pickString(fields.phone, fallbacks.phone ?? "").trim() || null;
  const ctaLabel = pickString(fields.ctaLabel, fallbacks.ctaLabel);
  const ctaUrl = pickString(fields.ctaUrl, fallbacks.ctaUrl ?? "").trim() || null;
  if (!phone && !ctaUrl) return null;
  return {
    key,
    label,
    phone,
    phoneTel: toTelHref(phone),
    ctaLabel,
    ctaUrl,
  };
}

export function mergeDealershipLocationWithCms(
  location: DealershipLocation,
  cms: DealershipCmsEntry | undefined,
): DealershipLocation {
  if (!cms) return location;

  const departments: DealershipDepartmentContact[] = [];
  for (const dept of [
    buildDepartmentContact("sales", "Sales", cms.sales, {
      ctaLabel: "Shop inventory",
    }),
    buildDepartmentContact("service", "Service", cms.service, {
      ctaLabel: "Schedule service",
    }),
    buildDepartmentContact("parts", "Parts", cms.parts, {
      ctaLabel: "Order parts",
    }),
  ]) {
    if (dept) departments.push(dept);
  }

  return {
    ...location,
    storeName: pickString(cms.storeName, location.storeName),
    addressLine1: pickString(cms.addressLine1, location.addressLine1),
    addressLine2: pickString(cms.addressLine2, location.addressLine2 ?? "") || null,
    viewUrl: pickString(cms.viewUrl, location.viewUrl),
    imageUrl: pickString(cms.imageUrl, location.imageUrl),
    mapPosition: {
      top: pickString(cms.mapTop, location.mapPosition.top),
      left: pickString(cms.mapLeft, location.mapPosition.left),
    },
    showOnInset: cms.showOnInset ?? location.showOnInset,
    viewCtaLabel: pickString(cms.viewCtaLabel, "View location"),
    departments,
  };
}

export function mergeServiceLocationWithCms(
  location: ServiceLocation,
  cms: DealershipCmsEntry | undefined,
): ServiceLocation {
  if (!cms) {
    return {
      ...location,
      departments: buildServiceDepartmentsFromLocation(location),
    };
  }

  const scheduleUrl =
    pickString(cms.service.ctaUrl, location.scheduleUrl ?? "") || null;
  const servicePhone =
    pickString(cms.service.phone, location.servicePhone ?? "") || null;

  const departments: DealershipDepartmentContact[] = [];
  for (const dept of [
    buildDepartmentContact("sales", "Sales", cms.sales, { ctaLabel: "Shop inventory" }),
    buildDepartmentContact("service", "Service", cms.service, {
      phone: servicePhone,
      ctaLabel: "Schedule service",
      ctaUrl: scheduleUrl,
    }),
    buildDepartmentContact("parts", "Parts", cms.parts, { ctaLabel: "Order parts" }),
  ]) {
    if (dept) departments.push(dept);
  }

  return {
    ...location,
    storeName: pickString(cms.storeName, location.storeName),
    address: pickString(
      [cms.addressLine1, cms.addressLine2].filter(Boolean).join(", "),
      location.address ?? "",
    ) || null,
    imageUrl: pickString(cms.imageUrl, location.imageUrl ?? ""),
    servicePhone,
    servicePhoneTel: toTelHref(servicePhone),
    scheduleUrl,
    scheduleAvailable: Boolean(scheduleUrl),
    callAvailable: Boolean(servicePhone && toTelHref(servicePhone)),
    scheduleCtaLabel: pickString(cms.service.ctaLabel, "Schedule Service"),
    departments,
  };
}

function buildServiceDepartmentsFromLocation(
  location: ServiceLocation,
): DealershipDepartmentContact[] {
  const departments: DealershipDepartmentContact[] = [];
  if (location.servicePhone || location.scheduleUrl) {
    departments.push({
      key: "service",
      label: "Service",
      phone: location.servicePhone,
      phoneTel: location.servicePhoneTel,
      ctaLabel: location.scheduleCtaLabel ?? "Schedule Service",
      ctaUrl: location.scheduleUrl,
    });
  }
  return departments;
}

export function mergeDealershipLocationsWithCms(
  locations: DealershipLocation[],
  entries: DealershipCmsEntry[] | undefined,
): DealershipLocation[] {
  return locations.map((location) =>
    mergeDealershipLocationWithCms(
      location,
      findDealershipCmsEntry(entries, location),
    ),
  );
}

export function mergeServiceLocationsWithCms(
  locations: ServiceLocation[],
  entries: DealershipCmsEntry[] | undefined,
): ServiceLocation[] {
  return locations.map((location) =>
    mergeServiceLocationWithCms(
      location,
      findDealershipCmsEntry(entries, location),
    ),
  );
}
