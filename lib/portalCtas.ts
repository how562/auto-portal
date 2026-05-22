import { PORTAL_CTA_FALLBACKS, PORTAL_CTA_KEYS } from "./portalCtaFallbacks";
import type { PortalCtaKey, PortalCtaMap, PortalCtaValue } from "./portalCtaTypes";
import { getSupabase } from "./supabase";

const CTA_SELECT = "cta_key, label, label_es, url";

interface PortalCtaRow {
  cta_key: string;
  label: string;
  label_es?: string | null;
  url: string | null;
}

function isMissingTableError(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    msg.includes("Could not find the table") ||
    msg.includes("schema cache")
  );
}

function isMissingColumnError(error: { message?: string }): boolean {
  const msg = error.message ?? "";
  return msg.includes("does not exist") && msg.includes("column");
}

function isPortalCtaKey(key: string): key is PortalCtaKey {
  return (PORTAL_CTA_KEYS as string[]).includes(key);
}

function mergeCtaValue(
  key: PortalCtaKey,
  row: Partial<PortalCtaValue> | undefined,
): PortalCtaValue {
  const fallback = PORTAL_CTA_FALLBACKS[key];
  const label = row?.label?.trim();
  const labelEs = row?.labelEs?.trim();
  const url = row?.url?.trim();
  return {
    label: label || fallback.label,
    labelEs: labelEs || fallback.labelEs,
    url: url !== undefined && url !== "" ? url : fallback.url,
  };
}

export function buildPortalCtaMap(rows: PortalCtaRow[]): PortalCtaMap {
  const overrides: Partial<Record<PortalCtaKey, PortalCtaValue>> = {};

  for (const row of rows) {
    if (!isPortalCtaKey(row.cta_key)) continue;
    overrides[row.cta_key] = {
      label: row.label?.trim() ?? "",
      labelEs: row.label_es?.trim() || null,
      url: row.url?.trim() || null,
    };
  }

  const map = {} as PortalCtaMap;
  for (const key of PORTAL_CTA_KEYS) {
    map[key] = mergeCtaValue(key, overrides[key]);
  }
  return map;
}

export function getDefaultPortalCtaMap(): PortalCtaMap {
  return buildPortalCtaMap([]);
}

async function fetchCtaRows(): Promise<PortalCtaRow[] | null> {
  const supabase = getSupabase();

  const withActive = await supabase
    .from("portal_cta_settings")
    .select(`${CTA_SELECT}, is_active`)
    .eq("is_active", true);

  if (!withActive.error) {
    return (withActive.data ?? []) as PortalCtaRow[];
  }

  if (
    isMissingTableError(withActive.error) ||
    isMissingColumnError(withActive.error)
  ) {
    if (isMissingTableError(withActive.error)) return null;

    const plain = await supabase.from("portal_cta_settings").select(CTA_SELECT);
    if (plain.error) {
      if (isMissingTableError(plain.error)) return null;
      throw plain.error;
    }
    return (plain.data ?? []) as PortalCtaRow[];
  }

  const withoutActive = await supabase.from("portal_cta_settings").select(CTA_SELECT);
  if (withoutActive.error) {
    if (isMissingTableError(withoutActive.error)) return null;
    console.warn(`portal_cta_settings: ${withoutActive.error.message}`);
    return null;
  }
  return (withoutActive.data ?? []) as PortalCtaRow[];
}

/** Load CTAs from Supabase; missing keys use PORTAL_CTA_FALLBACKS. */
export async function fetchPortalCtaSettings(): Promise<PortalCtaMap> {
  try {
    const rows = await fetchCtaRows();
    if (!rows) return getDefaultPortalCtaMap();
    return buildPortalCtaMap(rows);
  } catch {
    return getDefaultPortalCtaMap();
  }
}
