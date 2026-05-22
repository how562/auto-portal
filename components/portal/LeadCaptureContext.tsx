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
import type { Vehicle } from "@/lib/types";

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

interface LeadCaptureState {
  openLead: (options: OpenLeadOptions) => void;
}

const LeadCaptureContext = createContext<LeadCaptureState | null>(null);

export function LeadCaptureProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<LeadAction>("general-shortlist");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [vehicleLabel, setVehicleLabel] = useState<string | null>(null);
  const [shopperIntent, setShopperIntent] = useState("");

  const openLead = useCallback((options: OpenLeadOptions) => {
    setAction(options.action);
    setVehicleId(options.vehicle?.id ?? null);
    setStoreId(
      options.storeId ?? options.vehicle?.store_id ?? null,
    );
    setVehicleLabel(
      options.vehicle ? formatVehicleLabel(options.vehicle) : null,
    );
    setShopperIntent(options.shopperIntent ?? "");
    setModalOpen(true);
  }, []);

  const value = useMemo(() => ({ openLead }), [openLead]);

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
