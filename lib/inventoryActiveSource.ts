import { cache } from "react";
import { getSupabase } from "./supabase";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";
import {
  FALLBACK_ACTIVE_INVENTORY_PROVIDER,
  inventoryProviderEqFilter,
  resolveVehicleInventoryProvider,
  type InventoryProvider,
} from "./inventoryProviders";
import type { Vehicle } from "./types";

const PUBLIC_VEHICLE_SELECT =
  "id, store_id, vin, year, make, model, trim, condition, body_style, internet_price, msrp, sale_price, mileage, stock_number, primary_image_url, dealer_name, image_count, has_images, data_quality_score, created_at, imported_at";

interface StoreProviderSetting {
  store_id: string;
  provider: InventoryProvider;
}

/** Map each store to its active inventory provider (legacy fallback when unset). */
export const getActiveProviderByStoreMap = cache(
  async (): Promise<Map<string, InventoryProvider>> => {
    const supabase = getSupabase();
    const { data: settings, error: settingsError } = await supabase
      .from("dealership_inventory_settings")
      .select("store_id, active_inventory_feed_source_id");

    const map = new Map<string, InventoryProvider>();

    if (settingsError || !settings?.length) {
      if (settingsError) {
        console.warn(
          `dealership_inventory_settings: ${settingsError.message} — using legacy HomeNet fallback`,
        );
      }
      return map;
    }

    const sourceIdSet = new Set<string>();
    for (const row of settings ?? []) {
      const id = row.active_inventory_feed_source_id as string | null;
      if (id) sourceIdSet.add(id);
    }
    const sourceIds = Array.from(sourceIdSet);

    const providerBySourceId = new Map<string, InventoryProvider>();
    if (sourceIds.length > 0) {
      const { data: sources } = await supabase
        .from("inventory_feed_sources")
        .select("id, provider")
        .in("id", sourceIds);

      for (const src of sources ?? []) {
        providerBySourceId.set(src.id as string, src.provider as InventoryProvider);
      }
    }

    for (const row of settings ?? []) {
      const storeId = row.store_id as string;
      const sourceId = row.active_inventory_feed_source_id as string | null;
      if (sourceId && providerBySourceId.has(sourceId)) {
        map.set(storeId, providerBySourceId.get(sourceId)!);
      }
    }
    return map;
  },
);

/**
 * Active inventory provider for a dealership (store).
 * `dealershipId` is the store UUID in this app.
 */
export async function getActiveInventoryProvider(
  dealershipId: string,
): Promise<InventoryProvider> {
  const map = await getActiveProviderByStoreMap();
  return map.get(dealershipId) ?? FALLBACK_ACTIVE_INVENTORY_PROVIDER;
}

/**
 * Apply active-provider filter to a vehicles query.
 * HomeNet includes `inventory_provider IS NULL` (legacy untagged rows).
 *
 * Uses a structural cast so PostgREST/Supabase builder generics do not explode.
 */
export function applyInventoryProviderFilter<T>(
  query: T,
  provider: InventoryProvider,
): T {
  const spec = inventoryProviderEqFilter(provider);
  const q = query as T & {
    eq: (column: string, value: unknown) => T;
    or: (filters: string) => T;
  };
  if (spec.kind === "eq") {
    return q.eq("inventory_provider", spec.provider);
  }
  return q.or(spec.filter);
}

/** Apply a resolved filter spec (single provider or per-store OR). */
export function applyActiveInventoryProviderFilterSpec<T>(
  query: T,
  spec: ActiveInventoryProviderFilterSpec,
): T {
  if (spec.kind === "provider") {
    return applyInventoryProviderFilter(query, spec.provider);
  }
  const q = query as T & { or: (filters: string) => T };
  return q.or(spec.orFilter);
}

/** Active inventory rows for one dealership — never mixes providers. */
export async function getActiveInventoryForDealership(
  dealershipId: string,
  limit = 500,
): Promise<Vehicle[]> {
  const {
    applyInventoryScopeToQuery,
    resolveInventoryScope,
  } = await import("./inventoryAudiences");

  const scope = await resolveInventoryScope({ siteStoreId: dealershipId });
  if (!scope || scope.kind === "multi") {
    return [];
  }

  const supabase = getSupabase();
  let query = supabase
    .from("vehicles")
    .select(PUBLIC_VEHICLE_SELECT)
    .eq("status", "active");

  query = applyInventoryScopeToQuery(query, scope);

  const { data, error } = await query
    .order("internet_price", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw new Error(
      `Failed to load active inventory for dealership: ${error.message}`,
    );
  }

  return (data ?? []) as Vehicle[];
}

function buildStoreProviderOrFilter(
  pairs: StoreProviderSetting[],
): string | null {
  if (pairs.length === 0) return null;
  return pairs
    .map((p) => {
      const providerFilter = inventoryProviderEqFilter(p.provider);
      if (providerFilter.kind === "eq") {
        return `and(store_id.eq.${p.store_id},inventory_provider.eq.${providerFilter.provider})`;
      }
      return `and(store_id.eq.${p.store_id},or(${providerFilter.filter}))`;
    })
    .join(",");
}

/**
 * Restrict a vehicles query to each store's active provider only.
 * When no settings exist, filters to legacy HomeNet (includes null provider rows).
 */
export type ActiveInventoryProviderFilterSpec =
  | { kind: "provider"; provider: InventoryProvider }
  | { kind: "per_store_or"; orFilter: string };

/** Resolve how to filter vehicles for the active feed source(s). */
export async function getActiveInventoryProviderFilterSpec(options?: {
  storeId?: string;
}): Promise<ActiveInventoryProviderFilterSpec> {
  const storeId = options?.storeId?.trim();

  if (storeId) {
    const provider = await getActiveInventoryProvider(storeId);
    return { kind: "provider", provider };
  }

  const map = await getActiveProviderByStoreMap();
  if (map.size === 0) {
    return { kind: "provider", provider: FALLBACK_ACTIVE_INVENTORY_PROVIDER };
  }

  const pairs: StoreProviderSetting[] = [];
  map.forEach((provider, sid) => {
    pairs.push({ store_id: sid, provider });
  });

  const orFilter = buildStoreProviderOrFilter(pairs);
  if (!orFilter) {
    return { kind: "provider", provider: FALLBACK_ACTIVE_INVENTORY_PROVIDER };
  }

  return { kind: "per_store_or", orFilter };
}

/** Live active vehicle count for a store + provider (null rows count as HomeNet). */
export async function countActiveVehiclesForProvider(
  storeId: string,
  provider: InventoryProvider,
): Promise<number> {
  if (!isSupabaseAdminConfigured()) return 0;

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("store_id", storeId)
    .eq("status", "active");

  query = applyInventoryProviderFilter(query, provider);

  const { count, error } = await query;
  if (error) {
    console.warn(`countActiveVehiclesForProvider: ${error.message}`);
    return 0;
  }
  return count ?? 0;
}

/** Service-role: refresh cached vehicle counts on feed source rows. */
export async function syncInventoryFeedSourceCounts(
  storeId?: string,
): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  const supabase = getSupabaseAdmin();
  let countQuery = supabase
    .from("vehicles")
    .select("store_id, inventory_provider")
    .eq("status", "active")
    .not("store_id", "is", null);

  if (storeId) {
    countQuery = countQuery.eq("store_id", storeId);
  }

  const { data: vehicles, error } = await countQuery;
  if (error) {
    console.warn(`syncInventoryFeedSourceCounts: ${error.message}`);
    return;
  }

  const counts = new Map<string, number>();
  for (const row of vehicles ?? []) {
    const sid = row.store_id as string;
    const prov = resolveVehicleInventoryProvider(
      row.inventory_provider as string | null,
    );
    const key = `${sid}:${prov}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  let sourcesQuery = supabase
    .from("inventory_feed_sources")
    .select("id, store_id, provider");

  if (storeId) {
    sourcesQuery = sourcesQuery.eq("store_id", storeId);
  }

  const { data: allSources } = await sourcesQuery;

  for (const src of allSources ?? []) {
    const key = `${src.store_id}:${src.provider}`;
    await supabase
      .from("inventory_feed_sources")
      .update({
        last_vehicle_count: counts.get(key) ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", src.id);
  }
}

export async function touchInventoryFeedSourceImport(
  storeId: string,
  provider: InventoryProvider,
  vehicleCount: number,
): Promise<void> {
  if (!isSupabaseAdminConfigured()) return;

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  await supabase
    .from("inventory_feed_sources")
    .update({
      last_import_at: now,
      last_vehicle_count: vehicleCount,
      updated_at: now,
    })
    .eq("store_id", storeId)
    .eq("provider", provider);
}
