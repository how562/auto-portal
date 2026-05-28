import type { SupabaseClient } from "@supabase/supabase-js";
import type { CanonicalVehicleRow } from "@/lib/import/canonicalVehicle";
import { hasCanonicalUpsertKey } from "@/lib/import/canonicalVehicle";
import type { InventoryProvider } from "@/lib/inventoryProviders";

export interface VehicleUpsertError {
  row: number;
  message: string;
  import_key?: string;
}

const UPSERT_BATCH_SIZE = 50;

function storeVinProviderKey(
  storeId: string,
  vin: string,
  provider: InventoryProvider,
): string {
  return `${storeId}\0${vin}\0${provider}`;
}

function toMergeUpdate(row: CanonicalVehicleRow) {
  return {
    internet_price: row.internet_price,
    msrp: row.msrp,
    sale_price: row.sale_price,
    image_urls: row.image_urls,
    image_count: row.image_count,
    has_images: row.has_images,
    data_quality_score: row.data_quality_score,
    dealer_name: row.dealer_name,
    updated_at: new Date().toISOString(),
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

/**
 * Upsert canonical rows keyed by (store_id, vin, inventory_provider).
 * Provider-agnostic — callers supply rows from HomeNet or vAuto parsers only.
 */
export async function upsertCanonicalVehicleBatch(
  supabase: SupabaseClient,
  batch: CanonicalVehicleRow[],
  provider: InventoryProvider,
): Promise<{ upserted: number; errors: VehicleUpsertError[] }> {
  const errors: VehicleUpsertError[] = [];
  let upserted = 0;

  const keyedRows = batch.filter(hasCanonicalUpsertKey);
  const unkeyedRows = batch.filter((row) => !hasCanonicalUpsertKey(row));

  for (const row of unkeyedRows) {
    errors.push({
      row: 0,
      import_key: row.import_key,
      message: !row.store_id?.trim()
        ? "Missing store_id — row skipped"
        : "Missing VIN — row skipped (upsert requires store_id + vin)",
    });
  }

  if (keyedRows.length === 0) {
    return { upserted, errors };
  }

  const orFilter = keyedRows
    .map(
      (row) =>
        `and(store_id.eq.${row.store_id},vin.eq.${row.vin},inventory_provider.eq.${provider})`,
    )
    .join(",");

  const { data: existing, error: lookupError } = await supabase
    .from("vehicles")
    .select("store_id, vin, inventory_provider")
    .or(orFilter);

  if (lookupError) {
    for (const row of keyedRows) {
      errors.push({
        row: 0,
        import_key: row.import_key,
        message: `Upsert lookup failed: ${lookupError.message}`,
      });
    }
    return { upserted, errors };
  }

  const existingKeys = new Set(
    (existing ?? []).map((row) =>
      storeVinProviderKey(
        row.store_id as string,
        row.vin as string,
        (row.inventory_provider as InventoryProvider) ?? provider,
      ),
    ),
  );

  const toInsert = keyedRows.filter(
    (row) =>
      !existingKeys.has(
        storeVinProviderKey(row.store_id, row.vin, row.inventory_provider),
      ),
  );
  const toUpdate = keyedRows.filter((row) =>
    existingKeys.has(
      storeVinProviderKey(row.store_id, row.vin, row.inventory_provider),
    ),
  );

  if (toInsert.length > 0) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert(toInsert)
      .select("id");

    if (error) {
      for (const row of toInsert) {
        errors.push({
          row: 0,
          import_key: row.import_key,
          message: `Insert failed: ${error.message}`,
        });
      }
    } else {
      upserted += data?.length ?? toInsert.length;
    }
  }

  if (toUpdate.length > 0) {
    const { data, error } = await supabase
      .from("vehicles")
      .upsert(
        toUpdate.map((row) => ({
          store_id: row.store_id,
          vin: row.vin,
          inventory_provider: row.inventory_provider,
          ...toMergeUpdate(row),
        })),
        { onConflict: "store_id,vin,inventory_provider" },
      )
      .select("id");

    if (error) {
      for (const row of toUpdate) {
        errors.push({
          row: 0,
          import_key: row.import_key,
          message: `Update failed: ${error.message}`,
        });
      }
    } else {
      upserted += data?.length ?? toUpdate.length;
    }
  }

  return { upserted, errors };
}

export async function upsertCanonicalVehicles(
  supabase: SupabaseClient,
  rows: CanonicalVehicleRow[],
  provider: InventoryProvider,
): Promise<{ upserted: number; errors: VehicleUpsertError[] }> {
  let upserted = 0;
  const errors: VehicleUpsertError[] = [];

  for (const batch of chunk(rows, UPSERT_BATCH_SIZE)) {
    const result = await upsertCanonicalVehicleBatch(supabase, batch, provider);
    upserted += result.upserted;
    errors.push(...result.errors);
  }

  return { upserted, errors };
}

export { UPSERT_BATCH_SIZE };
