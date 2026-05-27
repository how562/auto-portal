import { getActiveInventoryProvider } from "./inventoryActiveSource";
import { getSupabase } from "./supabase";
import type { Collection, CollectionRule, Vehicle } from "./types";

const VEHICLE_SELECT =
  "id, store_id, vin, year, make, model, trim, condition, body_style, internet_price, msrp, sale_price, mileage, stock_number, primary_image_url, image_urls, dealer_name, image_count, has_images, data_quality_score";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 24;

function haystack(vehicle: Vehicle): string {
  return [vehicle.make, vehicle.model, vehicle.trim, vehicle.body_style]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function ruleValue(rule: CollectionRule): string {
  return (rule.value ?? "").toLowerCase();
}

function fieldValue(vehicle: Vehicle, field: string): string | number | null {
  const key = field as keyof Vehicle;
  const v = vehicle[key];
  if (typeof v === "number") return v;
  if (typeof v === "string") return v.toLowerCase();
  return null;
}

function matchesRule(vehicle: Vehicle, rule: CollectionRule): boolean {
  const raw = fieldValue(vehicle, rule.field);
  const target = ruleValue(rule);
  if (raw === null) return false;

  const text = String(raw).toLowerCase();
  const num = typeof raw === "number" ? raw : Number(raw);
  const targetNum = Number(target);

  switch (rule.operator) {
    case "equals":
      return text === target;
    case "not_equals":
      return text !== target;
    case "contains":
      return text.includes(target);
    case "less_than":
      return !Number.isNaN(num) && !Number.isNaN(targetNum) && num < targetNum;
    case "greater_than":
      return !Number.isNaN(num) && !Number.isNaN(targetNum) && num > targetNum;
    case "less_than_or_equal":
      return !Number.isNaN(num) && !Number.isNaN(targetNum) && num <= targetNum;
    case "greater_than_or_equal":
      return !Number.isNaN(num) && !Number.isNaN(targetNum) && num >= targetNum;
    default:
      return haystack(vehicle).includes(target);
  }
}

export function applyCollectionRules(
  vehicles: Vehicle[],
  rules: CollectionRule[],
): Vehicle[] {
  if (rules.length === 0) return vehicles;
  return vehicles.filter((v) => rules.every((r) => matchesRule(v, r)));
}

async function fetchCollection(
  collectionId: string,
): Promise<Collection | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("collections")
    .select("id, store_id, name")
    .eq("id", collectionId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as Collection;
}

async function fetchCollectionRules(
  collectionId: string,
): Promise<CollectionRule[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("collection_rules")
    .select("id, collection_id, field, operator, value")
    .eq("collection_id", collectionId);

  if (error) return [];
  return (data ?? []) as CollectionRule[];
}

export async function fetchVehiclesForCollection(
  collectionId: string,
  limit = DEFAULT_LIMIT,
): Promise<Vehicle[]> {
  const collection = await fetchCollection(collectionId);
  if (!collection?.store_id) return [];

  const rules = await fetchCollectionRules(collectionId);
  const cap = Math.min(Math.max(limit, 1), MAX_LIMIT);

  const supabase = getSupabase();
  const activeProvider = await getActiveInventoryProvider(collection.store_id);
  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .eq("store_id", collection.store_id)
    .eq("status", "active")
    .eq("inventory_provider", activeProvider)
    .order("year", { ascending: false, nullsFirst: false })
    .limit(80);

  if (error) {
    throw new Error(`Failed to load collection vehicles: ${error.message}`);
  }

  const filtered = applyCollectionRules((data ?? []) as Vehicle[], rules);
  return filtered.slice(0, cap);
}
