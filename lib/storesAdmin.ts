import { getSupabaseAdmin } from "./supabaseAdmin";
import { JLR_POOL_STORE_ID } from "./inventoryAudiences";

export interface AdminStoreOption {
  id: string;
  name: string;
  inventoryRole?: "dealership" | "inventory_pool";
  isInventoryPool?: boolean;
}

export async function listStoresForAdmin(options?: {
  includePools?: boolean;
}): Promise<AdminStoreOption[]> {
  const includePools = options?.includePools === true;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, inventory_role")
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load stores: ${error.message}`);
  }

  return (data ?? [])
    .map((row) => {
      const role =
        row.inventory_role === "inventory_pool"
          ? ("inventory_pool" as const)
          : ("dealership" as const);
      const isPool = role === "inventory_pool" || row.id === JLR_POOL_STORE_ID;
      const baseName =
        typeof row.name === "string" ? row.name.trim() : "Unnamed store";
      return {
        id: typeof row.id === "string" ? row.id : "",
        name: isPool ? `${baseName} (internal inventory pool)` : baseName,
        inventoryRole: role,
        isInventoryPool: isPool,
      };
    })
    .filter((row) => row.id && (includePools || !row.isInventoryPool));
}

