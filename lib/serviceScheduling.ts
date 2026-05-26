import { cache } from "react";
import {
  fallbackLogoUrl,
  findServiceFallback,
  staticFallbackLocations,
  type ServiceLocationFallback,
} from "./serviceSchedulingFallback";
import type { ServiceLocation } from "./serviceSchedulingTypes";
import { getSupabase } from "./supabase";

interface StoreServiceRow {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  address?: string | null;
  brand?: string | null;
  service_phone?: string | null;
  service_schedule_url?: string | null;
  is_active?: boolean | null;
}

const SELECT_WITH_SERVICE =
  "id, name, city, state, phone, website, address, brand, service_phone, service_schedule_url, is_active";

const SELECT_BASIC = "id, name, city, state, phone, website, is_active";

function isMissingColumnError(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "42703" ||
    msg.includes("column") ||
    msg.includes("schema cache")
  );
}

function toTelHref(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return digits.length === 10 ? `tel:+1${digits}` : `tel:+${digits}`;
}

function formatAddress(row: StoreServiceRow): string | null {
  if (row.address?.trim()) return row.address.trim();
  const parts = [row.city, row.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function guessScheduleUrl(website: string | null | undefined): string | null {
  const site = website?.trim();
  if (!site) return null;
  try {
    const url = new URL(site.startsWith("http") ? site : `https://${site}`);
    return `${url.origin}/schedule-service.htm`;
  } catch {
    return null;
  }
}

function mergeRow(
  row: StoreServiceRow,
  fallback: ServiceLocationFallback | null,
): ServiceLocation {
  const storeName = row.name.trim();
  const servicePhone =
    row.service_phone?.trim() ||
    fallback?.servicePhone?.trim() ||
    row.phone?.trim() ||
    null;
  const scheduleUrl =
    row.service_schedule_url?.trim() ||
    fallback?.serviceScheduleUrl?.trim() ||
    guessScheduleUrl(row.website) ||
    null;
  const brand = row.brand?.trim() || fallback?.brand || null;
  const logoAbrv = fallback?.logoStoreAbrv;
  const address = formatAddress(row) || fallback?.address || null;

  return {
    id: row.id,
    storeName,
    brand,
    logoUrl: logoAbrv ? fallbackLogoUrl(logoAbrv) : null,
    servicePhone,
    servicePhoneTel: toTelHref(servicePhone),
    address,
    scheduleUrl,
    scheduleAvailable: Boolean(scheduleUrl),
    callAvailable: Boolean(servicePhone && toTelHref(servicePhone)),
  };
}

function fallbackOnlyRow(entry: ServiceLocationFallback, index: number): ServiceLocation {
  const servicePhone = entry.servicePhone?.trim() ?? null;
  const scheduleUrl = entry.serviceScheduleUrl?.trim() ?? null;
  return {
    id: `fallback-${index}-${entry.nameIncludes.replace(/\s+/g, "-")}`,
    storeName: entry.storeName,
    brand: entry.brand,
    logoUrl: fallbackLogoUrl(entry.logoStoreAbrv),
    servicePhone,
    servicePhoneTel: toTelHref(servicePhone),
    address: entry.address,
    scheduleUrl,
    scheduleAvailable: Boolean(scheduleUrl),
    callAvailable: Boolean(servicePhone && toTelHref(servicePhone)),
  };
}

async function loadStoreRows(): Promise<StoreServiceRow[]> {
  const supabase = getSupabase();

  const full = await supabase
    .from("stores")
    .select(SELECT_WITH_SERVICE)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (!full.error) {
    return (full.data ?? []) as StoreServiceRow[];
  }

  if (!isMissingColumnError(full.error)) {
    throw new Error(`Failed to load stores: ${full.error.message}`);
  }

  const basic = await supabase
    .from("stores")
    .select(SELECT_BASIC)
    .order("name", { ascending: true });

  if (basic.error) {
    throw new Error(`Failed to load stores: ${basic.error.message}`);
  }

  const rows = (basic.data ?? []) as StoreServiceRow[];
  if ("is_active" in (rows[0] ?? {})) {
    return rows.filter((r) => r.is_active !== false);
  }
  return rows;
}

export const fetchServiceLocations = cache(async (): Promise<ServiceLocation[]> => {
  try {
    const rows = await loadStoreRows();
    if (rows.length === 0) {
      return staticFallbackLocations().map((entry, index) => fallbackOnlyRow(entry, index));
    }

    const merged = rows.map((row) => mergeRow(row, findServiceFallback(row.name)));
    merged.sort((a, b) => a.storeName.localeCompare(b.storeName));
    return merged;
  } catch {
    return staticFallbackLocations().map((entry, index) => fallbackOnlyRow(entry, index));
  }
});
