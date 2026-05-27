import type { InventoryProvider } from "@/lib/inventoryProviders";

/** Stages of the provider-agnostic ingestion pipeline. */
export type IngestionStage =
  | "intake"
  | "inspect"
  | "normalize"
  | "dedupe"
  | "upsert"
  | "reconcile"
  | "snapshot";

export type FeedImportRunKind = "import" | "intake" | "reconcile";

export type RawFeedParseStatus =
  | "pending"
  | "inspected"
  | "parsed"
  | "failed"
  | "skipped";

export type RawFeedStorageKind =
  | "sftp_retained"
  | "supabase_storage"
  | "inline_pending";

export type ImportFailureScope = "run" | "file" | "row";

export interface IngestionContext {
  provider: InventoryProvider;
  runId: string | null;
  runKind: FeedImportRunKind;
}

/**
 * VIN dedupe rule: unique per (store_id, vin, inventory_provider).
 * Public reads filter by the single active provider per store — never merge providers.
 */
export const VEHICLE_UPSERT_KEY = ["store_id", "vin", "inventory_provider"] as const;
