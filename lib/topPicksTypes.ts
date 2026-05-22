import type { PageSection } from "./cmsTypes";
import type { Vehicle } from "./types";

export type TopPickSlotId = "family" | "value" | "popular" | "under30k";

export const TOP_PICK_SLOT_ORDER: TopPickSlotId[] = [
  "family",
  "value",
  "popular",
  "under30k",
];

export interface TopPickCardData {
  slot: TopPickSlotId;
  vehicle: Vehicle;
  recommendationLabel: string;
  whyItFits: string;
}

export interface TopPicksCmsPayload {
  pageSection: PageSection | null;
}
