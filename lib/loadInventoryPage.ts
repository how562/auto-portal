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
}

function readParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  return typeof value === "string" ? value : undefined;
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

  try {
    if (useClientPagination) {
      const [stores, vehicles] = await Promise.all([
        fetchStores(),
        fetchInventoryVehicles(filters.sort),
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
      };
    }

    const [stores, result] = await Promise.all([
      fetchStores(),
      fetchInventoryVehiclesPage(
        page,
        INVENTORY_PAGE_SIZE,
        filters.sort,
        hasActiveInventoryFilters(filters) ? filters : undefined,
      ),
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
    };
  }
}
