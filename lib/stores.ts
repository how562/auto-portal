import { cache } from "react";
import { getSupabase } from "./supabase";
import type { Store } from "./types";

export const fetchStores = cache(async (): Promise<Store[]> => {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("stores")
    .select("id, name, city, state, phone, website, inventory_role")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load stores: ${error.message}`);
  }

  return ((data ?? []) as Array<Store & { inventory_role?: string }>)
    .filter((row) => row.inventory_role !== "inventory_pool")
    .map((row) => ({
      id: row.id,
      name: row.name,
      city: row.city,
      state: row.state,
      phone: row.phone,
      website: row.website,
    }));
});
