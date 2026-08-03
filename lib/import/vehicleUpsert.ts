import type { SupabaseClient } from "@supabase/supabase-js";
import type { CanonicalVehicleRow } from "@/lib/import/canonicalVehicle";
import {
  hasCanonicalStockKey,
  hasCanonicalUpsertKey,
  hasCanonicalVinKey,
} from "@/lib/import/canonicalVehicle";
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
  return `${storeId}\0${vin.toUpperCase()}\0${provider}`;
}

function storeStockProviderKey(
  storeId: string,
  stock: string,
  provider: InventoryProvider,
): string {
  return `${storeId}\0stock:${stock.toLowerCase()}\0${provider}`;
}

/** Full mutable-field refresh on match (not prices/images only). */
function toFullUpdatePayload(row: CanonicalVehicleRow) {
  const now = new Date().toISOString();
  return {
    stock_number: row.stock_number,
    dealer_name: row.dealer_name,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    condition: row.condition,
    body_style: row.body_style,
    exterior_color: row.exterior_color,
    interior_color: row.interior_color,
    mileage: row.mileage,
    internet_price: row.internet_price,
    msrp: row.msrp,
    sale_price: row.sale_price,
    primary_image_url: row.primary_image_url,
    image_urls: row.image_urls,
    image_count: row.image_count,
    has_images: row.has_images,
    data_quality_score: row.data_quality_score,
    status: row.status || "active",
    source_raw: row.source_raw,
    import_source: row.import_source,
    import_key: row.import_key,
    imported_at: row.imported_at || now,
    last_seen_at: row.last_seen_at || now,
    updated_at: now,
  };
}

function toInsertPayload(row: CanonicalVehicleRow) {
  return {
    store_id: row.store_id,
    vin: row.vin,
    inventory_provider: row.inventory_provider,
    ...toFullUpdatePayload(row),
  };
}

function chunk<T>(items: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    batches.push(items.slice(i, i + size));
  }
  return batches;
}

async function upsertVinKeyedBatch(
  supabase: SupabaseClient,
  rows: Array<CanonicalVehicleRow & { store_id: string; vin: string }>,
  provider: InventoryProvider,
): Promise<{ upserted: number; errors: VehicleUpsertError[] }> {
  const errors: VehicleUpsertError[] = [];
  let upserted = 0;

  const orFilter = rows
    .map(
      (row) =>
        `and(store_id.eq.${row.store_id},vin.eq.${row.vin},inventory_provider.eq.${provider})`,
    )
    .join(",");

  const { data: existing, error: lookupError } = await supabase
    .from("vehicles")
    .select("id, store_id, vin, inventory_provider")
    .or(orFilter);

  if (lookupError) {
    for (const row of rows) {
      errors.push({
        row: 0,
        import_key: row.import_key,
        message: `Upsert lookup failed: ${lookupError.message}`,
      });
    }
    return { upserted, errors };
  }

  const existingByKey = new Map(
    (existing ?? []).map((row) => [
      storeVinProviderKey(
        row.store_id as string,
        row.vin as string,
        (row.inventory_provider as InventoryProvider) ?? provider,
      ),
      row.id as string,
    ]),
  );

  const toInsert = rows.filter(
    (row) =>
      !existingByKey.has(
        storeVinProviderKey(row.store_id, row.vin, row.inventory_provider),
      ),
  );
  const toUpdate = rows.filter((row) =>
    existingByKey.has(
      storeVinProviderKey(row.store_id, row.vin, row.inventory_provider),
    ),
  );

  if (toInsert.length > 0) {
    const { data, error } = await supabase
      .from("vehicles")
      .insert(toInsert.map(toInsertPayload))
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

  for (const row of toUpdate) {
    const id = existingByKey.get(
      storeVinProviderKey(row.store_id, row.vin, row.inventory_provider),
    );
    if (!id) continue;
    const { error } = await supabase
      .from("vehicles")
      .update(toFullUpdatePayload(row))
      .eq("id", id);

    if (error) {
      errors.push({
        row: 0,
        import_key: row.import_key,
        message: `Update failed: ${error.message}`,
      });
    } else {
      upserted += 1;
    }
  }

  return { upserted, errors };
}

async function upsertStockKeyedRow(
  supabase: SupabaseClient,
  row: CanonicalVehicleRow & { store_id: string; stock_number: string },
  provider: InventoryProvider,
): Promise<{ upserted: number; errors: VehicleUpsertError[] }> {
  const { data: existing, error: lookupError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("store_id", row.store_id)
    .eq("stock_number", row.stock_number)
    .eq("inventory_provider", provider)
    .is("vin", null)
    .maybeSingle();

  if (lookupError) {
    return {
      upserted: 0,
      errors: [
        {
          row: 0,
          import_key: row.import_key,
          message: `Stock lookup failed: ${lookupError.message}`,
        },
      ],
    };
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("vehicles")
      .update(toFullUpdatePayload(row))
      .eq("id", existing.id as string);
    if (error) {
      return {
        upserted: 0,
        errors: [
          {
            row: 0,
            import_key: row.import_key,
            message: `Stock update failed: ${error.message}`,
          },
        ],
      };
    }
    return { upserted: 1, errors: [] };
  }

  const { error } = await supabase
    .from("vehicles")
    .insert(toInsertPayload(row))
    .select("id")
    .single();

  if (error) {
    return {
      upserted: 0,
      errors: [
        {
          row: 0,
          import_key: row.import_key,
          message: `Stock insert failed: ${error.message}`,
        },
      ],
    };
  }
  return { upserted: 1, errors: [] };
}

/**
 * Upsert canonical rows keyed by (store_id, vin, inventory_provider),
 * with stock-number fallback when VIN is absent.
 * Provider-agnostic — callers supply rows from HomeNet or vAuto parsers.
 *
 * Dual HomeNet+vAuto rows for the same VIN are allowed when the unique index
 * is provider-scoped (`vehicles_store_vin_provider_uidx`).
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
        : "Missing VIN and stock number — row skipped",
    });
  }

  const vinRows = keyedRows.filter(hasCanonicalVinKey);
  const stockRows = keyedRows.filter(hasCanonicalStockKey);

  // Deduplicate VIN keys within the batch (last wins).
  const vinDedup = new Map<string, (typeof vinRows)[number]>();
  for (const row of vinRows) {
    vinDedup.set(
      storeVinProviderKey(row.store_id, row.vin, row.inventory_provider),
      row,
    );
  }

  const uniqueVinRows = Array.from(vinDedup.values());
  if (uniqueVinRows.length > 0) {
    const result = await upsertVinKeyedBatch(supabase, uniqueVinRows, provider);
    upserted += result.upserted;
    errors.push(...result.errors);
  }

  const stockDedup = new Map<string, (typeof stockRows)[number]>();
  for (const row of stockRows) {
    stockDedup.set(
      storeStockProviderKey(
        row.store_id,
        row.stock_number,
        row.inventory_provider,
      ),
      row,
    );
  }

  for (const row of Array.from(stockDedup.values())) {
    const result = await upsertStockKeyedRow(supabase, row, provider);
    upserted += result.upserted;
    errors.push(...result.errors);
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

/**
 * Soft-deactivate active vAuto vehicles for a store whose VINs were not seen
 * in the current import. Never touches HomeNet or other providers.
 *
 * Stock-only rows (vin IS NULL) are intentionally left alone — they cannot be
 * safely reconciled against a VIN set from the feed.
 */
export async function softDeactivateMissingProviderVins(
  supabase: SupabaseClient,
  storeId: string,
  provider: InventoryProvider,
  seenVins: string[],
  options: { inactiveStatus?: string } = {},
): Promise<number> {
  if (provider !== "vauto") {
    // Safety: this reconcile helper is only for vAuto soft-deactivate.
    // Callers wanting HomeNet reconcile should add an explicit path.
  }

  const inactiveStatus = options.inactiveStatus ?? "inactive";
  const seen = new Set(
    seenVins.map((v) => v.trim().toUpperCase()).filter(Boolean),
  );

  const { data: active, error } = await supabase
    .from("vehicles")
    .select("id, vin")
    .eq("store_id", storeId)
    .eq("inventory_provider", provider)
    .eq("status", "active");

  if (error) {
    throw new Error(`Reconcile lookup failed: ${error.message}`);
  }

  const toDeactivate = (active ?? []).filter((row) => {
    const vin = ((row.vin as string | null) ?? "").trim().toUpperCase();
    if (!vin) return false; // stock-only: do not deactivate
    return !seen.has(vin);
  });

  if (toDeactivate.length === 0) return 0;

  const ids = toDeactivate.map((r) => r.id as string);
  // Chunk IN updates to avoid URL length limits
  let deactivated = 0;
  for (const idBatch of chunk(ids, 100)) {
    const { error: updateError } = await supabase
      .from("vehicles")
      .update({
        status: inactiveStatus,
        updated_at: new Date().toISOString(),
      })
      .in("id", idBatch)
      .eq("inventory_provider", provider)
      .eq("store_id", storeId);

    if (updateError) {
      throw new Error(`Reconcile deactivate failed: ${updateError.message}`);
    }
    deactivated += idBatch.length;
  }

  return deactivated;
}

export { UPSERT_BATCH_SIZE };
