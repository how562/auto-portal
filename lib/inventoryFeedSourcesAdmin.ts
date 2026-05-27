import {
  getActiveInventoryProvider,
  syncInventoryFeedSourceCounts,
} from "./inventoryActiveSource";
import {
  INVENTORY_PROVIDER_LABELS,
  type InventoryProvider,
} from "./inventoryProviders";
import { getSupabaseAdmin } from "./supabaseAdmin";

export interface InventoryFeedSourceRow {
  id: string;
  store_id: string;
  provider: InventoryProvider;
  label: string;
  status: "configured" | "disabled";
  last_import_at: string | null;
  last_vehicle_count: number;
  created_at: string;
  updated_at: string;
}

export interface DealershipInventorySettingsRow {
  store_id: string;
  active_inventory_feed_source_id: string | null;
  updated_at: string;
}

export interface StoreInventorySourcesBundle {
  storeId: string;
  storeName: string;
  activeFeedSourceId: string | null;
  activeProvider: InventoryProvider;
  sources: InventoryFeedSourceRow[];
  comparison: {
    homenetCount: number;
    vautoCount: number;
    difference: number;
    mismatchWarning: boolean;
  };
}

export async function ensureInventoryFeedSourcesForStore(
  storeId: string,
  storeName: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  for (const provider of ["homenet", "vauto"] as InventoryProvider[]) {
    const { error } = await supabase.from("inventory_feed_sources").upsert(
      {
        store_id: storeId,
        provider,
        label: INVENTORY_PROVIDER_LABELS[provider],
        status: "configured",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "store_id,provider" },
    );
    if (error) {
      throw new Error(`Failed to ensure feed source ${provider}: ${error.message}`);
    }
  }

  const { data: homenetSource } = await supabase
    .from("inventory_feed_sources")
    .select("id")
    .eq("store_id", storeId)
    .eq("provider", "homenet")
    .maybeSingle();

  const { data: existingSettings } = await supabase
    .from("dealership_inventory_settings")
    .select("store_id")
    .eq("store_id", storeId)
    .maybeSingle();

  if (!existingSettings && homenetSource?.id) {
    await supabase.from("dealership_inventory_settings").insert({
      store_id: storeId,
      active_inventory_feed_source_id: homenetSource.id,
    });
  }

  void storeName;
}

export async function ensureAllInventoryFeedSources(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, name")
    .order("name");

  if (error) {
    throw new Error(`Failed to load stores: ${error.message}`);
  }

  for (const store of stores ?? []) {
    await ensureInventoryFeedSourcesForStore(
      store.id as string,
      (store.name as string) ?? "Store",
    );
  }

  await syncInventoryFeedSourceCounts();
}

export async function listStoreInventorySourceBundles(): Promise<
  StoreInventorySourcesBundle[]
> {
  await ensureAllInventoryFeedSources();
  const supabase = getSupabaseAdmin();

  const { data: stores, error: storesError } = await supabase
    .from("stores")
    .select("id, name")
    .order("name");

  if (storesError) {
    throw new Error(`Failed to load stores: ${storesError.message}`);
  }

  const { data: sources, error: sourcesError } = await supabase
    .from("inventory_feed_sources")
    .select("*")
    .order("provider");

  if (sourcesError) {
    throw new Error(`Failed to load feed sources: ${sourcesError.message}`);
  }

  const { data: settings, error: settingsError } = await supabase
    .from("dealership_inventory_settings")
    .select("store_id, active_inventory_feed_source_id");

  if (settingsError) {
    throw new Error(`Failed to load inventory settings: ${settingsError.message}`);
  }

  const settingsByStore = new Map(
    (settings ?? []).map((s) => [
      s.store_id as string,
      s.active_inventory_feed_source_id as string | null,
    ]),
  );

  const sourcesByStore = new Map<string, InventoryFeedSourceRow[]>();
  for (const row of (sources ?? []) as InventoryFeedSourceRow[]) {
    const list = sourcesByStore.get(row.store_id) ?? [];
    list.push(row);
    sourcesByStore.set(row.store_id, list);
  }

  const bundles: StoreInventorySourcesBundle[] = [];

  for (const store of stores ?? []) {
    const storeId = store.id as string;
    const storeSources = sourcesByStore.get(storeId) ?? [];
    const homenet =
      storeSources.find((s) => s.provider === "homenet")?.last_vehicle_count ?? 0;
    const vauto =
      storeSources.find((s) => s.provider === "vauto")?.last_vehicle_count ?? 0;
    const activeFeedSourceId = settingsByStore.get(storeId) ?? null;
    const activeProvider = await getActiveInventoryProvider(storeId);

    bundles.push({
      storeId,
      storeName: (store.name as string) ?? "Store",
      activeFeedSourceId,
      activeProvider,
      sources: storeSources,
      comparison: {
        homenetCount: homenet,
        vautoCount: vauto,
        difference: Math.abs(homenet - vauto),
        mismatchWarning:
          homenet > 0 && vauto > 0 && Math.abs(homenet - vauto) > 0,
      },
    });
  }

  return bundles;
}

export async function setActiveInventoryFeedSource(
  storeId: string,
  feedSourceId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: source, error: sourceError } = await supabase
    .from("inventory_feed_sources")
    .select("id, store_id, provider")
    .eq("id", feedSourceId)
    .maybeSingle();

  if (sourceError || !source) {
    throw new Error("Feed source not found");
  }

  if (source.store_id !== storeId) {
    throw new Error("Feed source does not belong to this dealership");
  }

  const { error } = await supabase.from("dealership_inventory_settings").upsert(
    {
      store_id: storeId,
      active_inventory_feed_source_id: feedSourceId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "store_id" },
  );

  if (error) {
    throw new Error(`Failed to set active source: ${error.message}`);
  }
}
