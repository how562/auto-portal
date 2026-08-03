import {
  hasActiveInventoryFilters,
  needsSmartMatchFiltering,
  parseInventoryPage,
  readInventorySearchQuery,
  searchParamsToFilters,
  type InventoryFilters,
} from "@/lib/inventorySearch";
import {
  mergeInventoryFiltersWithPreset,
  type InventoryPagePreset,
} from "@/lib/inventorySitePages";
import { getInventoryAudiences } from "@/lib/inventoryAudiences";
import { fetchStores } from "@/lib/stores";
import {
  fetchInventoryVehicles,
  fetchInventoryVehiclesPage,
  INVENTORY_PAGE_SIZE,
} from "@/lib/vehicles";
import type { Store, Vehicle } from "@/lib/types";

export interface InventoryPageLoadResult {
  vehicles: Vehicle[];
  stores: Store[];
  filters: InventoryFilters;
  searchQuery: string | null;
  loadError: string | null;
  page: number;
  totalCount: number;
  serverPaginated: boolean;
  /** site_store_id → audience_key for JLR contextual VDP links */
  audienceByStoreId: Record<string, string>;
}

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  return typeof value === "string" ? value : undefined;
}

async function loadAudienceByStoreId(): Promise<Record<string, string>> {
  const audiences = await getInventoryAudiences();
  const map: Record<string, string> = {};
  for (const audience of audiences) {
    map[audience.site_store_id] = audience.audience_key;
  }
  return map;
}

export async function loadInventoryPageData(
  searchParams: Record<string, string | string[] | undefined>,
  options?: { preset?: InventoryPagePreset },
): Promise<InventoryPageLoadResult> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }

  let filters = searchParamsToFilters(params);
  if (options?.preset) {
    filters = mergeInventoryFiltersWithPreset(filters, options.preset);
  }

  const searchQuery = readInventorySearchQuery(params);
  const page = parseInventoryPage(readParam(searchParams, "page"));
  const useClientPagination =
    needsSmartMatchFiltering(filters) || searchQuery != null;
  const storeScope =
    filters.storeId !== "all" ? filters.storeId : undefined;

  try {
    if (useClientPagination) {
      const [stores, vehicles, audienceByStoreId] = await Promise.all([
        fetchStores(),
        fetchInventoryVehicles(filters.sort, storeScope),
        loadAudienceByStoreId(),
      ]);
      return {
        vehicles,
        stores,
        filters,
        searchQuery,
        loadError: null,
        page,
        totalCount: vehicles.length,
        serverPaginated: false,
        audienceByStoreId,
      };
    }

    const [stores, result, audienceByStoreId] = await Promise.all([
      fetchStores(),
      fetchInventoryVehiclesPage(
        page,
        INVENTORY_PAGE_SIZE,
        filters.sort,
        hasActiveInventoryFilters(filters) ? filters : undefined,
      ),
      loadAudienceByStoreId(),
    ]);

    return {
      vehicles: result.vehicles,
      stores,
      filters,
      searchQuery,
      loadError: null,
      page: result.page,
      totalCount: result.totalCount,
      serverPaginated: true,
      audienceByStoreId,
    };
  } catch (error: unknown) {
    return {
      vehicles: [],
      stores: [],
      filters,
      searchQuery,
      loadError:
        error instanceof Error ? error.message : "Failed to load inventory",
      page: 1,
      totalCount: 0,
      serverPaginated: true,
      audienceByStoreId: {},
    };
  }
}
