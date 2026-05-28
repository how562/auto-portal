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
}

export function hasCanonicalUpsertKey(
  row: CanonicalVehicleRow,
): row is CanonicalVehicleRow & { store_id: string; vin: string } {
  return Boolean(row.store_id?.trim() && row.vin?.trim());
}
