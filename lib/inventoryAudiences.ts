/**
 * Inventory audiences — query-time virtual inventories over a physical pool.
 * Jaguar / Land Rover share one imported vehicle set; no row duplication.
 */

import { cache } from "react";
import { getSupabase } from "./supabase";
import {
  applyInventoryProviderFilter,
  getActiveInventoryProvider,
  getActiveProviderByStoreMap,
} from "./inventoryActiveSource";
import {
  inventoryProviderEqFilter,
  type InventoryProvider,
} from "./inventoryProviders";
import {
  audienceMembershipOrFilter,
  canonicalVehiclePath,
  isInventoryAudienceKey,
  isJaguarMake,
  isLandRoverFamilyMake,
  isSharedPreownedCondition,
  jlrPoolUnionMembershipOrFilter,
  JLR_POOL_STORE_ID,
  normalizeConditionToken,
  normalizeMakeToken,
  vehicleDetailPathWithAudience,
  vehicleMatchesAnyJlrAudience,
  vehicleMatchesAudience,
  type InventoryAudienceKey,
  type InventoryAudienceRules,
} from "./inventoryAudienceRules";

export {
  audienceMembershipOrFilter,
  canonicalVehiclePath,
  isInventoryAudienceKey,
  isJaguarMake,
  isLandRoverFamilyMake,
  isSharedPreownedCondition,
  jlrPoolUnionMembershipOrFilter,
  JLR_POOL_STORE_ID,
  normalizeConditionToken,
  normalizeMakeToken,
  vehicleDetailPathWithAudience,
  vehicleMatchesAnyJlrAudience,
  vehicleMatchesAudience,
};
export type { InventoryAudienceKey, InventoryAudienceRules };

export type InventoryAudience = {
  id: string;
  audience_key: InventoryAudienceKey;
  label: string;
  site_store_id: string;
  source_store_id: string;
  rules: InventoryAudienceRules;
  is_active: boolean;
};

export type InventoryScope =
  | {
      kind: "store";
      storeId: string;
      provider: InventoryProvider;
    }
  | {
      kind: "audience";
      audienceKey: InventoryAudienceKey;
      siteStoreId: string;
      sourceStoreId: string;
      provider: InventoryProvider;
      rules: InventoryAudienceRules;
    }
  | {
      kind: "multi";
      provider: InventoryProvider | "per_store";
    };

export const getInventoryAudiences = cache(
  async (): Promise<InventoryAudience[]> => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("inventory_audiences")
      .select(
        "id, audience_key, label, site_store_id, source_store_id, rules, is_active",
      )
      .eq("is_active", true);

    if (error) {
      console.warn(`inventory_audiences: ${error.message}`);
      return [];
    }

    return (data ?? [])
      .filter((row) => isInventoryAudienceKey(row.audience_key))
      .map((row) => ({
        id: row.id as string,
        audience_key: row.audience_key as InventoryAudienceKey,
        label: row.label as string,
        site_store_id: row.site_store_id as string,
        source_store_id: row.source_store_id as string,
        rules: (row.rules ?? {}) as InventoryAudienceRules,
        is_active: Boolean(row.is_active),
      }));
  },
);

export async function getAudienceBySiteStoreId(
  siteStoreId: string,
): Promise<InventoryAudience | null> {
  const all = await getInventoryAudiences();
  return all.find((a) => a.site_store_id === siteStoreId) ?? null;
}

export async function getAudienceByKey(
  key: InventoryAudienceKey,
): Promise<InventoryAudience | null> {
  const all = await getInventoryAudiences();
  return all.find((a) => a.audience_key === key) ?? null;
}

export async function getAudienceBySourceStoreId(
  sourceStoreId: string,
): Promise<InventoryAudience[]> {
  const all = await getInventoryAudiences();
  return all.filter((a) => a.source_store_id === sourceStoreId);
}

export async function isInventoryPoolStoreId(storeId: string): Promise<boolean> {
  if (storeId === JLR_POOL_STORE_ID) return true;
  const audiences = await getInventoryAudiences();
  return audiences.some((a) => a.source_store_id === storeId);
}

export async function resolveInventoryScope(options?: {
  siteStoreId?: string | null;
  audienceKey?: string | null;
}): Promise<InventoryScope | null> {
  const keyRaw = options?.audienceKey?.trim();
  if (keyRaw && isInventoryAudienceKey(keyRaw)) {
    const audience = await getAudienceByKey(keyRaw);
    if (!audience) return null;
    const provider = await getActiveInventoryProvider(audience.source_store_id);
    return {
      kind: "audience",
      audienceKey: audience.audience_key,
      siteStoreId: audience.site_store_id,
      sourceStoreId: audience.source_store_id,
      provider,
      rules: audience.rules,
    };
  }

  const siteStoreId = options?.siteStoreId?.trim();
  if (!siteStoreId || siteStoreId === "all") {
    return { kind: "multi", provider: "per_store" };
  }

  if (await isInventoryPoolStoreId(siteStoreId)) {
    return null;
  }

  const audience = await getAudienceBySiteStoreId(siteStoreId);
  if (audience) {
    const provider = await getActiveInventoryProvider(audience.source_store_id);
    return {
      kind: "audience",
      audienceKey: audience.audience_key,
      siteStoreId: audience.site_store_id,
      sourceStoreId: audience.source_store_id,
      provider,
      rules: audience.rules,
    };
  }

  const provider = await getActiveInventoryProvider(siteStoreId);
  return { kind: "store", storeId: siteStoreId, provider };
}

export function applyInventoryScopeToQuery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  scope: InventoryScope,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (scope.kind === "store") {
    let next = query.eq("store_id", scope.storeId);
    next = applyInventoryProviderFilter(next, scope.provider);
    return next;
  }

  if (scope.kind === "audience") {
    let next = query.eq("store_id", scope.sourceStoreId);
    next = applyInventoryProviderFilter(next, scope.provider);
    next = next.or(audienceMembershipOrFilter(scope.audienceKey));
    return next;
  }

  return query;
}

export async function getPublicMultiStoreInventoryOrFilter(): Promise<string | null> {
  const [providerMap, audiences] = await Promise.all([
    getActiveProviderByStoreMap(),
    getInventoryAudiences(),
  ]);

  const audienceSiteIds = new Set(audiences.map((a) => a.site_store_id));
  const poolIds = new Set(audiences.map((a) => a.source_store_id));
  poolIds.add(JLR_POOL_STORE_ID);

  const branches: string[] = [];

  providerMap.forEach((provider, storeId) => {
    if (poolIds.has(storeId) || audienceSiteIds.has(storeId)) return;
    const providerFilter = inventoryProviderEqFilter(provider);
    if (providerFilter.kind === "eq") {
      branches.push(
        `and(store_id.eq.${storeId},inventory_provider.eq.${providerFilter.provider})`,
      );
    } else {
      branches.push(
        `and(store_id.eq.${storeId},or(${providerFilter.filter}))`,
      );
    }
  });

  const poolHandled = new Set<string>();
  for (const audience of audiences) {
    if (poolHandled.has(audience.source_store_id)) continue;
    poolHandled.add(audience.source_store_id);
    const provider = await getActiveInventoryProvider(audience.source_store_id);
    const providerFilter = inventoryProviderEqFilter(provider);
    const membership = jlrPoolUnionMembershipOrFilter();
    if (providerFilter.kind === "eq") {
      branches.push(
        `and(store_id.eq.${audience.source_store_id},inventory_provider.eq.${providerFilter.provider},or(${membership}))`,
      );
    } else {
      branches.push(
        `and(store_id.eq.${audience.source_store_id},or(${providerFilter.filter}),or(${membership}))`,
      );
    }
  }

  return branches.length > 0 ? branches.join(",") : null;
}

export async function applyPublicInventoryQueryScope(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  siteStoreId?: string | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ query: any; scope: InventoryScope | null }> {
  const scope = await resolveInventoryScope({ siteStoreId });
  if (!scope) {
    return {
      query: query.eq("id", "00000000-0000-0000-0000-000000000000"),
      scope: null,
    };
  }

  if (scope.kind === "store" || scope.kind === "audience") {
    return { query: applyInventoryScopeToQuery(query, scope), scope };
  }

  const orFilter = await getPublicMultiStoreInventoryOrFilter();
  if (!orFilter) {
    return {
      query: applyInventoryProviderFilter(query, "homenet"),
      scope,
    };
  }
  return { query: query.or(orFilter), scope };
}

export async function countAudienceVehicles(
  audienceKey: InventoryAudienceKey,
  options?: { provider?: InventoryProvider },
): Promise<number> {
  const audience = await getAudienceByKey(audienceKey);
  if (!audience) return 0;
  const provider =
    options?.provider ??
    (await getActiveInventoryProvider(audience.source_store_id));
  const supabase = getSupabase();
  let query = supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("status", "active")
    .eq("store_id", audience.source_store_id);
  query = applyInventoryProviderFilter(query, provider);
  query = query.or(audienceMembershipOrFilter(audienceKey));
  const { count, error } = await query;
  if (error) {
    console.warn(`countAudienceVehicles(${audienceKey}): ${error.message}`);
    return 0;
  }
  return count ?? 0;
}
