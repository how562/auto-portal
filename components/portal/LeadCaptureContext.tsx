"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { formatVehicleLabel } from "@/lib/format";
import type { LeadAction } from "@/lib/leads";
import {
  buildVdpLeadVehicleSnapshot,
  buildVdpShopperIntent,
} from "@/lib/vdpLead";
import type { Store, Vehicle } from "@/lib/types";

export interface OpenLeadOptions {
  action: LeadAction;
  vehicle?: Vehicle;
  shopperIntent?: string;
  storeId?: string | null;
}

export interface OpenVdpLeadOptions {
  action: LeadAction;
  vehicle: Vehicle;
  store?: Store | null;
  storeId?: string | null;
  shopperIntent?: string;
}

interface LeadCaptureState {
  openLead: (options: OpenLeadOptions) => void;
  openVdpLead: (options: OpenVdpLeadOptions) => void;
  openValueTrade: (options: {
    vehicle: Vehicle;
    store?: Store | null;
    storeId?: string | null;
  }) => void;
}

const LeadCaptureContext = createContext<LeadCaptureState | null>(null);

export function LeadCaptureProvider({ children }: { children: ReactNode }) {
  const openLead = useCallback(
    (options: OpenLeadOptions) => {
      // Temporarily keep lead actions non-blocking while modal wiring is repaired.
      if (typeof window !== "undefined") {
        console.warn("[LeadCapture] Lead modal currently unavailable", options.action);
      }
    },
    [],
  );

  const openVdpLead = useCallback(
    (options: OpenVdpLeadOptions) => {
      const snapshot = buildVdpLeadVehicleSnapshot(
        options.vehicle,
        options.store ?? null,
      );
      const baseIntent =
        options.shopperIntent?.trim() ||
        `Inquiry for ${formatVehicleLabel(options.vehicle)}`;
      openLead(
        {
          action: options.action,
          vehicle: options.vehicle,
          storeId: options.storeId ?? options.vehicle.store_id ?? null,
          shopperIntent: buildVdpShopperIntent(baseIntent, snapshot),
        },
      );
    },
    [openLead],
  );

  const openValueTrade = useCallback(
    (options: { vehicle: Vehicle; store?: Store | null; storeId?: string | null }) => {
      if (typeof window !== "undefined" && window.MotoAcquire?.openVVRDrawer) {
        window.MotoAcquire.openVVRDrawer();
        return;
      }

      const label = formatVehicleLabel(options.vehicle);
      openVdpLead({
        action: "trade",
        vehicle: options.vehicle,
        store: options.store,
        storeId: options.storeId,
        shopperIntent: `Value my trade — interested in ${label}`,
      });
    },
    [openVdpLead],
  );

  const value = useMemo(
    () => ({ openLead, openVdpLead, openValueTrade }),
    [openLead, openVdpLead, openValueTrade],
  );

  return (
    <LeadCaptureContext.Provider value={value}>
      {children}
    </LeadCaptureContext.Provider>
  );
}

export function useLeadCapture() {
  const ctx = useContext(LeadCaptureContext);
  if (ctx) return ctx;
  return {
    openLead: () => undefined,
    openVdpLead: () => undefined,
    openValueTrade: () => undefined,
  };
}

export function useOptionalLeadCapture(): LeadCaptureState["openLead"] | undefined {
  return useContext(LeadCaptureContext)?.openLead;
}
