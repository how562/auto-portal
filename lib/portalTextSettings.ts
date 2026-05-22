import {
  PORTAL_TEXT_FALLBACKS,
  PORTAL_TEXT_KEYS,
} from "./portalTextFallbacks";
import type { PortalTextMap, PortalTextValue } from "./portalTextTypes";
import { getSupabase } from "./supabase";

const TEXT_SELECT = "text_key, label_en, label_es, category";

interface PortalTextRow {
  text_key: string;
  label_en: string;
  label_es?: string | null;
  category?: string | null;
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

function mergeTextValue(
  key: string,
  row: Partial<PortalTextValue> | undefined,
): PortalTextValue {
  const fallback = PORTAL_TEXT_FALLBACKS[key as keyof typeof PORTAL_TEXT_FALLBACKS];
  const labelEn = row?.labelEn?.trim();
  const labelEs = row?.labelEs?.trim();
  if (fallback) {
    return {
      labelEn: labelEn || fallback.labelEn,
      labelEs: labelEs || fallback.labelEs,
      category: row?.category ?? fallback.category,
    };
  }
  return {
    labelEn: labelEn || key,
    labelEs: labelEs || null,
    category: row?.category ?? null,
  };
}

export function buildPortalTextMap(rows: PortalTextRow[]): PortalTextMap {
  const overrides: PortalTextMap = {};

  for (const row of rows) {
    const key = row.text_key?.trim();
    if (!key) continue;
    overrides[key] = {
      labelEn: row.label_en?.trim() ?? "",
      labelEs: row.label_es?.trim() || null,
      category: row.category?.trim() || null,
    };
  }

  const map: PortalTextMap = { ...overrides };

  for (const key of PORTAL_TEXT_KEYS) {
    map[key] = mergeTextValue(key, overrides[key]);
  }

  return map;
}

export function getDefaultPortalTextMap(): PortalTextMap {
  const map: PortalTextMap = {};
  for (const key of PORTAL_TEXT_KEYS) {
    map[key] = PORTAL_TEXT_FALLBACKS[key];
  }
  return map;
}

async function fetchTextRows(): Promise<PortalTextRow[] | null> {
  const supabase = getSupabase();

  const withActive = await supabase
    .from("portal_text_settings")
    .select(`${TEXT_SELECT}, is_active`)
    .eq("is_active", true);

  if (!withActive.error) {
    return (withActive.data ?? []) as PortalTextRow[];
  }

  if (
    isMissingTableError(withActive.error) ||
    isMissingColumnError(withActive.error)
  ) {
    if (isMissingTableError(withActive.error)) return null;

    const plain = await supabase.from("portal_text_settings").select(TEXT_SELECT);
    if (plain.error) {
      if (isMissingTableError(plain.error)) return null;
      throw plain.error;
    }
    return (plain.data ?? []) as PortalTextRow[];
  }

  const withoutActive = await supabase
    .from("portal_text_settings")
    .select(TEXT_SELECT);
  if (withoutActive.error) {
    if (isMissingTableError(withoutActive.error)) return null;
    console.warn(`portal_text_settings: ${withoutActive.error.message}`);
    return null;
  }
  return (withoutActive.data ?? []) as PortalTextRow[];
}

/** Load portal copy from Supabase once per request; merges with PORTAL_TEXT_FALLBACKS. */
export async function fetchPortalTextSettings(): Promise<PortalTextMap> {
  try {
    const rows = await fetchTextRows();
    if (!rows) return getDefaultPortalTextMap();
    return buildPortalTextMap(rows);
  } catch {
    return getDefaultPortalTextMap();
  }
}
