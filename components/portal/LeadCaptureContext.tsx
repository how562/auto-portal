"use client";

import dynamic from "next/dynamic";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { formatVehicleLabel } from "@/lib/format";
import type { LeadAction } from "@/lib/leads";
import {
  buildVdpLeadVehicleSnapshot,
  buildVdpShopperIntent,
} from "@/lib/vdpLead";
import type { Store, Vehicle } from "@/lib/types";

const LeadModal = dynamic(
  () => import("./LeadModal").then((mod) => mod.LeadModal),
  { ssr: false },
);

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
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<LeadAction>("general-shortlist");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [vehicleLabel, setVehicleLabel] = useState<string | null>(null);
  const [shopperIntent, setShopperIntent] = useState("");

  const openLeadModal = useCallback(
    (
      nextAction: LeadAction,
      vehicle: Vehicle | undefined,
      nextStoreId: string | null,
      intent: string,
    ) => {
      setAction(nextAction);
      setVehicleId(vehicle?.id ?? null);
      setStoreId(nextStoreId ?? vehicle?.store_id ?? null);
      setVehicleLabel(vehicle ? formatVehicleLabel(vehicle) : null);
      setShopperIntent(intent);
      setModalOpen(true);
    },
    [],
  );

  const openLead = useCallback(
    (options: OpenLeadOptions) => {
      openLeadModal(
        options.action,
        options.vehicle,
        options.storeId ?? options.vehicle?.store_id ?? null,
        options.shopperIntent ?? "",
      );
    },
    [openLeadModal],
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
      openLeadModal(
        options.action,
        options.vehicle,
        options.storeId ?? options.vehicle.store_id ?? null,
        buildVdpShopperIntent(baseIntent, snapshot),
      );
    },
    [openLeadModal],
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
      <LeadModal
        open={modalOpen}
        action={action}
        vehicleId={vehicleId}
        storeId={storeId}
        vehicleLabel={vehicleLabel}
        shopperIntent={shopperIntent}
        onClose={() => setModalOpen(false)}
      />
    </LeadCaptureContext.Provider>
  );
}

export function useLeadCapture() {
  const ctx = useContext(LeadCaptureContext);
  if (!ctx) {
    throw new Error("useLeadCapture must be used within LeadCaptureProvider");
  }
  return ctx;
}

export function useOptionalLeadCapture(): LeadCaptureState["openLead"] | undefined {
  return useContext(LeadCaptureContext)?.openLead;
}
