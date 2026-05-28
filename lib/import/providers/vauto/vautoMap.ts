import type { CanonicalVehicleRow } from "@/lib/import/canonicalVehicle";

export interface MapVautoRowOptions {
  forcedStoreId?: string | null;
  importSource?: string;
  storeIdByDealerName?: Map<string, string>;
}

/**
 * Map a vAuto feed row to canonical inventory.
 * Column aliases will be filled in after the first production export is inspected.
 */
export function mapVautoRow(
  _raw: Record<string, string>,
  _options: MapVautoRowOptions = {},
): CanonicalVehicleRow | null {
  void _raw;
  void _options;
  return null;
}

export function mapVautoRowsToCanonical(
  rows: Record<string, string>[],
  options: MapVautoRowOptions = {},
): CanonicalVehicleRow[] {
  const result: CanonicalVehicleRow[] = [];
  for (const raw of rows) {
    const mapped = mapVautoRow(raw, options);
    if (mapped) result.push(mapped);
  }
  return result;
}
