import { getDefaultVdpCtaSettings, mergeVdpCtaSettings } from "./vdpCta";
import { isVdpCtaActionKey, isVdpCtaAppliesTo } from "./vdpCtaDefaults";
import type { VdpCtaSettingRow } from "./vdpCtaTypes";
import { getSupabase } from "./supabase";

const VDP_CTA_SELECT =
  "action_key, label, label_es, sort_order, is_active, applies_to";

interface VdpCtaDbRow {
  action_key: string;
  label: string;
  label_es?: string | null;
  sort_order: number;
  is_active: boolean;
  applies_to: string;
}

function isMissingTableError(error: { message?: string; code?: string }): boolean {
  const msg = error.message ?? "";
  return (
    error.code === "PGRST205" ||
    msg.includes("Could not find the table") ||
    msg.includes("schema cache")
  );
}

function normalizeRow(row: VdpCtaDbRow): VdpCtaSettingRow | null {
  const actionKey = row.action_key?.trim();
  if (!actionKey || !isVdpCtaActionKey(actionKey)) return null;
  const appliesTo = row.applies_to?.trim() ?? "all";
  return {
    action_key: actionKey,
    label: row.label?.trim() || actionKey,
    label_es: row.label_es?.trim() || null,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_active: row.is_active !== false,
    applies_to: isVdpCtaAppliesTo(appliesTo) ? appliesTo : "all",
  };
}

export async function fetchVdpCtaSettings(): Promise<VdpCtaSettingRow[]> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return getDefaultVdpCtaSettings();
  }

  const { data, error } = await supabase
    .from("portal_vdp_cta_settings")
    .select(VDP_CTA_SELECT)
    .order("sort_order", { ascending: true });

  if (error) {
    if (isMissingTableError(error)) return getDefaultVdpCtaSettings();
    console.error("[VDP CTA] Failed to load settings:", error.message);
    return getDefaultVdpCtaSettings();
  }

  const rows = (data ?? [])
    .map((row) => normalizeRow(row as VdpCtaDbRow))
    .filter((row): row is VdpCtaSettingRow => row != null);

  if (rows.length === 0) return getDefaultVdpCtaSettings();
  return mergeVdpCtaSettings(rows);
}
