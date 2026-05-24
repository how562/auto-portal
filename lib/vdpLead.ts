import { getEffectiveVehiclePrice } from "./format";
import type { LeadAction } from "./leads";
import type { VdpCtaActionKey } from "./vdpCtaTypes";
import type { Store, Vehicle } from "./types";

/** CRM-facing vehicle snapshot for DriveCentric ADF (no internal IDs). */
export interface VdpLeadVehicleSnapshot {
  vin: string;
  stockNumber: string;
  year: number | null;
  make: string;
  model: string;
  trim: string;
  price: number | null;
  store: string;
}

export function vdpCtaActionToLeadAction(
  actionKey: VdpCtaActionKey,
): LeadAction | null {
  switch (actionKey) {
    case "check_availability":
      return "availability";
    case "get_eprice":
      return "eprice";
    case "unlock_savings":
      return "savings";
    case "value_trade":
      return "trade";
    default:
      return null;
  }
}

export function buildVdpLeadVehicleSnapshot(
  vehicle: Vehicle,
  store: Store | null,
): VdpLeadVehicleSnapshot {
  const { amount } = getEffectiveVehiclePrice(vehicle);
  const storeName =
    store?.name?.trim() ||
    vehicle.dealer_name?.trim() ||
    "";

  return {
    vin: vehicle.vin?.trim() ?? "",
    stockNumber: vehicle.stock_number?.trim() ?? "",
    year: vehicle.year,
    make: vehicle.make?.trim() ?? "",
    model: vehicle.model?.trim() ?? "",
    trim: vehicle.trim?.trim() ?? "",
    price: amount,
    store: storeName,
  };
}

/** Server-side ADF enrichment (Edge Function parses this prefix). */
export const VDP_LEAD_METADATA_PREFIX = "__vdp_meta__:";

export function encodeVdpLeadMetadata(snapshot: VdpLeadVehicleSnapshot): string {
  return `${VDP_LEAD_METADATA_PREFIX}${JSON.stringify(snapshot)}`;
}

export function buildVdpShopperIntent(
  message: string,
  snapshot: VdpLeadVehicleSnapshot,
): string {
  const trimmed = message.trim();
  const meta = encodeVdpLeadMetadata(snapshot);
  return trimmed ? `${trimmed}\n${meta}` : meta;
}
