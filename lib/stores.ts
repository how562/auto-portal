import { getSupabase } from "./supabase";
import type { Store } from "./types";

export async function fetchStores(): Promise<Store[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("stores")
    .select("id, name, city, state, phone, website")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load stores: ${error.message}`);
  }

  return (data ?? []) as Store[];
}
