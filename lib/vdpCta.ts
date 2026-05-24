import type { Locale } from "./i18n/types";
import { isUsedVehicle } from "./vdpDisplay";
import {
  isVdpCtaActionKey,
  isVdpCtaAppliesTo,
  VDP_CTA_DEFAULTS,
} from "./vdpCtaDefaults";
import type {
  ResolvedVdpCta,
  VdpCtaActionKey,
  VdpCtaAppliesTo,
  VdpCtaSettingRow,
} from "./vdpCtaTypes";
import type { VehicleDetail } from "./types";

function vehicleAppliesTo(
  vehicle: Pick<VehicleDetail, "condition">,
): Exclude<VdpCtaAppliesTo, "all"> {
  const condition = vehicle.condition?.trim().toLowerCase() ?? "";
  if (condition === "new") return "new";
  if (condition.includes("cert") || condition === "cpo") return "certified";
  if (isUsedVehicle(vehicle.condition)) return "used";
  return "used";
}

function rowAppliesToVehicle(
  appliesTo: VdpCtaAppliesTo,
  vehicleScope: Exclude<VdpCtaAppliesTo, "all">,
): boolean {
  if (appliesTo === "all") return true;
  if (appliesTo === "used") {
    return vehicleScope === "used" || vehicleScope === "certified";
  }
  return appliesTo === vehicleScope;
}

function resolveLabel(
  row: VdpCtaSettingRow,
  locale: Locale,
): string {
  if (locale === "es") {
    return row.label_es?.trim() || row.label.trim();
  }
  return row.label.trim();
}

export function mergeVdpCtaSettings(
  rows: VdpCtaSettingRow[],
): VdpCtaSettingRow[] {
  const byKey = new Map<VdpCtaActionKey, VdpCtaSettingRow>();
  for (const fallback of VDP_CTA_DEFAULTS) {
    byKey.set(fallback.action_key, { ...fallback });
  }
  for (const row of rows) {
    if (!isVdpCtaActionKey(row.action_key)) continue;
    const appliesTo = isVdpCtaAppliesTo(row.applies_to)
      ? row.applies_to
      : byKey.get(row.action_key)?.applies_to ?? "all";
    byKey.set(row.action_key, {
      ...byKey.get(row.action_key)!,
      ...row,
      applies_to: appliesTo,
    });
  }
  return Array.from(byKey.values());
}

export function resolveVdpCtasForVehicle(
  settings: VdpCtaSettingRow[],
  vehicle: VehicleDetail,
  locale: Locale,
): ResolvedVdpCta[] {
  const scope = vehicleAppliesTo(vehicle);
  const merged = mergeVdpCtaSettings(settings);

  return merged
    .filter((row) => row.is_active !== false)
    .filter((row) => rowAppliesToVehicle(row.applies_to, scope))
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((row) => ({
      actionKey: row.action_key,
      label: resolveLabel(row, locale),
      sortOrder: row.sort_order,
    }));
}

export function getDefaultVdpCtaSettings(): VdpCtaSettingRow[] {
  return VDP_CTA_DEFAULTS.map((row) => ({ ...row }));
}
