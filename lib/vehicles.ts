import { getSupabase } from "./supabase";
import type { InventorySort } from "./inventorySearch";
import type { Store, Vehicle, VehicleDetail } from "./types";

export const INVENTORY_PAGE_SIZE = 20;

export const PORTAL_VEHICLE_SELECT =
  "id, store_id, year, make, model, trim, condition, body_style, internet_price, mileage, stock_number, primary_image_url";

export const VEHICLE_DETAIL_SELECT =
  "id, store_id, vin, stock_number, condition, year, make, model, trim, body_style, exterior_color, interior_color, mileage, internet_price, primary_image_url";

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
  sort: InventorySort = "newest",
): Promise<InventoryPageResult> {
  const supabase = getSupabase();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("vehicles")
    .select(PORTAL_VEHICLE_SELECT, { count: "exact" })
    .eq("status", "active");

  if (sort === "value") {
    query = query.order("internet_price", {
      ascending: true,
      nullsFirst: false,
    });
  } else {
    query = query.order("year", { ascending: false, nullsFirst: false });
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
  sort: InventorySort = "newest",
): Promise<Vehicle[]> {
  const supabase = getSupabase();

  let query = supabase
    .from("vehicles")
    .select(PORTAL_VEHICLE_SELECT)
    .eq("status", "active");

  if (sort === "value") {
    query = query.order("internet_price", {
      ascending: true,
      nullsFirst: false,
    });
  } else {
    query = query.order("year", { ascending: false, nullsFirst: false });
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

  return (data as VehicleDetail | null) ?? null;
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

  const addRows = (rows: Vehicle[] | null) => {
    for (const row of rows ?? []) {
      if (!seen.has(row.id)) {
        seen.add(row.id);
        collected.push(row);
      }
    }
  };

  if (vehicle.body_style) {
    const { data } = await supabase
      .from("vehicles")
      .select(PORTAL_VEHICLE_SELECT)
      .eq("status", "active")
      .eq("body_style", vehicle.body_style)
      .neq("id", excludeId)
      .limit(SIMILAR_VEHICLE_LIMIT);
    addRows(data as Vehicle[] | null);
  }

  if (collected.length < SIMILAR_VEHICLE_LIMIT && vehicle.store_id) {
    const { data } = await supabase
      .from("vehicles")
      .select(PORTAL_VEHICLE_SELECT)
      .eq("status", "active")
      .eq("store_id", vehicle.store_id)
      .neq("id", excludeId)
      .limit(SIMILAR_VEHICLE_LIMIT);
    addRows(data as Vehicle[] | null);
  }

  if (collected.length < SIMILAR_VEHICLE_LIMIT && vehicle.make && vehicle.model) {
    const { data } = await supabase
      .from("vehicles")
      .select(PORTAL_VEHICLE_SELECT)
      .eq("status", "active")
      .eq("make", vehicle.make)
      .eq("model", vehicle.model)
      .neq("id", excludeId)
      .limit(SIMILAR_VEHICLE_LIMIT);
    addRows(data as Vehicle[] | null);
  }

  if (collected.length < 4) {
    const { data } = await supabase
      .from("vehicles")
      .select(PORTAL_VEHICLE_SELECT)
      .eq("status", "active")
      .neq("id", excludeId)
      .order("year", { ascending: false })
      .limit(SIMILAR_VEHICLE_LIMIT);
    addRows(data as Vehicle[] | null);
  }

  return collected.slice(0, SIMILAR_VEHICLE_LIMIT);
}
