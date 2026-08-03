import type { InventoryProvider } from "@/lib/inventoryProviders";

/**
 * Provider-neutral vehicle row produced by feed parsers (HomeNet, vAuto, …).
 * Upsert and validation operate only on this shape — not on provider parsers.
 */
export interface CanonicalVehicleRow {
  import_key: string;
  vin: string | null;
  stock_number: string | null;
  store_id: string | null;
  dealer_name: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  condition: string | null;
  body_style: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  mileage: number | null;
  internet_price: number | null;
  msrp: number | null;
  sale_price: number | null;
  primary_image_url: string | null;
  image_urls: string[] | null;
  image_count: number;
  has_images: boolean;
  data_quality_score: number;
  status: string;
  source_raw: Record<string, string>;
  import_source: string;
  inventory_provider: InventoryProvider;
  imported_at: string;
  /** Soft-presence timestamp refreshed on every successful import match. */
  last_seen_at?: string;
}

/** VIN-keyed identity for preferred upsert matching. */
export function hasCanonicalVinKey(
  row: CanonicalVehicleRow,
): row is CanonicalVehicleRow & { store_id: string; vin: string } {
  return Boolean(row.store_id?.trim() && row.vin?.trim());
}

/**
 * Stock-only identity when VIN is absent.
 * Used as upsert fallback; stock-only rows are not included in VIN reconcile.
 */
export function hasCanonicalStockKey(
  row: CanonicalVehicleRow,
): row is CanonicalVehicleRow & { store_id: string; stock_number: string } {
  return Boolean(
    row.store_id?.trim() &&
      row.stock_number?.trim() &&
      !row.vin?.trim(),
  );
}

/** True when the row can be upserted (VIN preferred, else stock). */
export function hasCanonicalUpsertKey(row: CanonicalVehicleRow): boolean {
  return hasCanonicalVinKey(row) || hasCanonicalStockKey(row);
}
