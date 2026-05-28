import type { CanonicalVehicleRow } from "@/lib/import/canonicalVehicle";
import {
  mapDealerSendRow,
  type MapDealerSendRowOptions,
} from "@/lib/import/dealerSendMap";

/** Map a HomeNet DealerSend row into the shared canonical inventory model. */
export function mapDealerSendRowToCanonical(
  raw: Record<string, string>,
  options: MapDealerSendRowOptions = {},
): CanonicalVehicleRow | null {
  const row = mapDealerSendRow(raw, options);
  if (!row) return null;
  return { ...row, inventory_provider: "homenet" };
}

export function mapDealerSendRowsToCanonical(
  rows: Record<string, string>[],
  options: MapDealerSendRowOptions = {},
): CanonicalVehicleRow[] {
  const result: CanonicalVehicleRow[] = [];
  for (const raw of rows) {
    const mapped = mapDealerSendRowToCanonical(raw, options);
    if (mapped) result.push(mapped);
  }
  return result;
}
