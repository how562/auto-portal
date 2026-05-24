"use client";

import { VehiclePricingPanel } from "@/components/vdp/VehiclePricingPanel";
import type { Store, VehicleDetail } from "@/lib/types";

interface VehicleLeadPanelProps {
  vehicle: VehicleDetail;
  store: Store | null;
}

/** @deprecated Prefer VehiclePricingPanel — kept for backward compatibility. */
export function VehicleLeadPanel({ vehicle, store }: VehicleLeadPanelProps) {
  return <VehiclePricingPanel vehicle={vehicle} store={store} />;
}
