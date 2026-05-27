import {
  getActiveInventoryProvider,
  getActiveInventoryProviderFilterSpec,
} from "./inventoryActiveSource";
import { getSupabase } from "./supabase";
import type { InventorySort } from "./inventorySearch";
import { INVENTORY_PAGE_SIZE } from "./inventorySearch";
import type { InventoryFilters } from "./inventorySearch";
import { applyServerInventoryFilters } from "./inventoryServerFilters";
import type { Store, Vehicle, VehicleDetail } from "./types";

interface OrderSpec {
  column: string;
  ascending: boolean;
  nullsFirst: boolean;
}

/**
 * ORDER BY chain for each premium sort.
 *
 * The default `merchandised` order matches the admin spec exactly:
 *   has_images DESC, image_count DESC, data_quality_score DESC,
 *   internet_price DESC NULLS LAST
 *
 * Backed by `vehicles_merchandising_idx` so the planner can range-scan
 * at scale. Every customer-facing sort still pushes imageless vehicles
 * down — only `needs-attention` (admin only) surfaces them first.
 */
function orderingFor(sort: InventorySort): OrderSpec[] {
  switch (sort) {
    case "photos":
      return [
        { column: "image_count", ascending: false, nullsFirst: false },
        { column: "data_quality_score", ascending: false, nullsFirst: false },
        { column: "internet_price", ascending: false, nullsFirst: false },
      ];
    case "needs-attention":
      return [
        { column: "has_images", ascending: true, nullsFirst: true },
        { column: "data_quality_score", ascending: true, nullsFirst: true },
        { column: "image_count", ascending: true, nullsFirst: true },
        { column: "year", ascending: false, nullsFirst: false },
      ];
    case "newest-added":
      return [
        { column: "imported_at", ascending: false, nullsFirst: false },
        { column: "created_at", ascending: false, nullsFirst: false },
      ];
    case "value":
      return [
        { column: "has_images", ascending: false, nullsFirst: false },
        { column: "internet_price", ascending: true, nullsFirst: false },
        { column: "year", ascending: false, nullsFirst: false },
      ];
    case "newest":
      return [
        { column: "has_images", ascending: false, nullsFirst: false },
        { column: "year", ascending: false, nullsFirst: false },
      ];
    case "merchandised":
    case "match":
    default:
      return [
        { column: "has_images", ascending: false, nullsFirst: false },
        { column: "image_count", ascending: false, nullsFirst: false },
        { column: "data_quality_score", ascending: false, nullsFirst: false },
        { column: "internet_price", ascending: false, nullsFirst: false },
      ];
  }
}

export { INVENTORY_PAGE_SIZE } from "./inventorySearch";

export const PORTAL_VEHICLE_SELECT =
  "id, store_id, vin, year, make, model, trim, condition, body_style, internet_price, msrp, sale_price, mileage, stock_number, primary_image_url, dealer_name, image_count, has_images, data_quality_score, created_at, imported_at";

export const VEHICLE_DETAIL_SELECT =
  "id, store_id, vin, stock_number, condition, year, make, model, trim, body_style, exterior_color, interior_color, mileage, internet_price, msrp, sale_price, primary_image_url, image_urls, dealer_name, image_count, has_images, data_quality_score, source_raw, inventory_provider, created_at, imported_at";

const PORTAL_VEHICLE_LIMIT = 80;
const SIMILAR_VEHICLE_LIMIT = 8;

export interface InventoryPageResult {
  vehicles: Vehicle[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/** Paginated active inventory from Supabase (20 per page by default). */
export async function fetchInventoryVehiclesPage(
  page = 1,
  pageSize = INVENTORY_PAGE_SIZE,
  sort: InventorySort = "merchandised",
  filters?: InventoryFilters,
): Promise<InventoryPageResult> {
  const supabase = getSupabase();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const providerSpec = await getActiveInventoryProviderFilterSpec({
    storeId:
      filters && filters.storeId !== "all" ? filters.storeId : undefined,
  });
  let query = supabase
    .from("vehicles")
    .select(PORTAL_VEHICLE_SELECT, { count: "exact" })
    .eq("status", "active");

  if (providerSpec.kind === "provider") {
    query = query.eq("inventory_provider", providerSpec.provider);
  } else {
    query = query.or(providerSpec.orFilter);
  }

  if (filters) {
    query = applyServerInventoryFilters(query, filters);
  }

  for (const spec of orderingFor(sort)) {
    query = query.order(spec.column, {
      ascending: spec.ascending,
      nullsFirst: spec.nullsFirst,
    });
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Failed to load inventory: ${error.message}`);
  }

  return {
    vehicles: (data ?? []) as Vehicle[],
    totalCount: count ?? 0,
    page: safePage,
    pageSize,
  };
}

/** All active inventory rows (for client-side smart-match filtering). */
export async function fetchInventoryVehicles(
  sort: InventorySort = "merchandised",
): Promise<Vehicle[]> {
  const supabase = getSupabase();

  const providerSpec = await getActiveInventoryProviderFilterSpec();
  let query = supabase
    .from("vehicles")
    .select(PORTAL_VEHICLE_SELECT)
    .eq("status", "active");

  if (providerSpec.kind === "provider") {
    query = query.eq("inventory_provider", providerSpec.provider);
  } else {
    query = query.or(providerSpec.orFilter);
  }

  for (const spec of orderingFor(sort)) {
    query = query.order(spec.column, {
      ascending: spec.ascending,
      nullsFirst: spec.nullsFirst,
    });
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load inventory: ${error.message}`);
  }

  return (data ?? []) as Vehicle[];
}

export async function fetchPortalVehicles(
  storeId?: string,
): Promise<Vehicle[]> {
  const supabase = getSupabase();

  let query = supabase
    .from("vehicles")
    .select(PORTAL_VEHICLE_SELECT)
    .eq("status", "active")
    .order("internet_price", { ascending: true, nullsFirst: false })
    .limit(PORTAL_VEHICLE_LIMIT);

  if (storeId) {
    query = query.eq("store_id", storeId);
  }

  const providerSpec = await getActiveInventoryProviderFilterSpec({ storeId });
  if (providerSpec.kind === "provider") {
    query = query.eq("inventory_provider", providerSpec.provider);
  } else {
    query = query.or(providerSpec.orFilter);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load portal vehicles: ${error.message}`);
  }

  return (data ?? []) as Vehicle[];
}

export async function fetchVehicleById(
  id: string,
): Promise<VehicleDetail | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_DETAIL_SELECT)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load vehicle: ${error.message}`);
  }

  const vehicle = data as (VehicleDetail & { inventory_provider?: string }) | null;
  if (!vehicle) return null;
  if (!vehicle.store_id) return vehicle;

  const activeProvider = await getActiveInventoryProvider(vehicle.store_id);
  const rowProvider = vehicle.inventory_provider ?? "homenet";
  if (rowProvider !== activeProvider) return null;

  return vehicle;
}

export async function fetchStoreById(storeId: string): Promise<Store | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("stores")
    .select("id, name, city, state, phone, website")
    .eq("id", storeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load store: ${error.message}`);
  }

  return (data as Store | null) ?? null;
}

export async function fetchSimilarVehicles(
  vehicle: VehicleDetail,
): Promise<Vehicle[]> {
  const supabase = getSupabase();
  const excludeId = vehicle.id;
  const collected: Vehicle[] = [];
  const seen = new Set<string>([excludeId]);
  const activeProvider = vehicle.store_id
    ? await getActiveInventoryProvider(vehicle.store_id)
    : null;

  const addRows = (rows: Vehicle[] | null) => {
    for (const row of rows ?? []) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        collected.push(row);
      }
    }
  };

  if (vehicle.body_style) {
    let query = supabase
      .from("vehicles")
      .select(PORTAL_VEHICLE_SELECT)
      .eq("status", "active")
      .eq("body_style", vehicle.body_style)
      .neq("id", excludeId)
      .limit(SIMILAR_VEHICLE_LIMIT);
    if (activeProvider) {
      query = query.eq("inventory_provider", activeProvider);
    }
    const { data } = await query;
    addRows(data as Vehicle[] | null);
  }

  if (collected.length < SIMILAR_VEHICLE_LIMIT && vehicle.store_id) {
    let query = supabase
      .from("vehicles")
      .select(PORTAL_VEHICLE_SELECT)
      .eq("status", "active")
      .eq("store_id", vehicle.store_id)
      .neq("id", excludeId)
      .limit(SIMILAR_VEHICLE_LIMIT);
    if (activeProvider) {
      query = query.eq("inventory_provider", activeProvider);
    }
    const { data } = await query;
    addRows(data as Vehicle[] | null);
  }

  if (collected.length < SIMILAR_VEHICLE_LIMIT && vehicle.make && vehicle.model) {
    let query = supabase
      .from("vehicles")
      .select(PORTAL_VEHICLE_SELECT)
      .eq("status", "active")
      .eq("make", vehicle.make)
      .eq("model", vehicle.model)
      .neq("id", excludeId)
      .limit(SIMILAR_VEHICLE_LIMIT);
    if (activeProvider) {
      query = query.eq("inventory_provider", activeProvider);
    }
    const { data } = await query;
    addRows(data as Vehicle[] | null);
  }

  if (collected.length < 4) {
    let query = supabase
      .from("vehicles")
      .select(PORTAL_VEHICLE_SELECT)
      .eq("status", "active")
      .neq("id", excludeId)
      .order("year", { ascending: false })
      .limit(SIMILAR_VEHICLE_LIMIT);
    if (activeProvider) {
      query = query.eq("inventory_provider", activeProvider);
    }
    const { data } = await query;
    addRows(data as Vehicle[] | null);
  }

  return collected.slice(0, SIMILAR_VEHICLE_LIMIT);
}
