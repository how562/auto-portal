import { getSupabaseAdmin } from "./supabaseAdmin";

export interface AdminStoreOption {
  id: string;
  name: string;
}

export async function listStoresForAdmin(): Promise<AdminStoreOption[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load stores: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => ({
      id: typeof row.id === "string" ? row.id : "",
      name: typeof row.name === "string" ? row.name.trim() : "Unnamed store",
    }))
    .filter((row) => row.id);
}
