import { InventoryPageClient } from "@/components/inventory/InventoryPageClient";
import { brandPageTitle, BRAND_NAME } from "@/lib/brand";
import {
  hasActiveInventoryFilters,
  needsSmartMatchFiltering,
  parseInventoryPage,
  readInventorySearchQuery,
  searchParamsToFilters,
} from "@/lib/inventorySearch";
import { fetchStores } from "@/lib/stores";
import {
  fetchInventoryVehicles,
  fetchInventoryVehiclesPage,
  INVENTORY_PAGE_SIZE,
} from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export const metadata = {
  title: brandPageTitle("Find Your Match"),
  description: `A guided discovery experience across ${BRAND_NAME}—curated matches, not a traditional lot listing.`,
};

interface InventoryPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function readParam(
  searchParams: InventoryPageProps["searchParams"],
  key: string,
): string | undefined {
  const value = searchParams[key];
  return typeof value === "string" ? value : undefined;
}

async function loadInventory(searchParams: InventoryPageProps["searchParams"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }

  const filters = searchParamsToFilters(params);
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
        loadError: null as string | null,
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
      loadError: null as string | null,
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

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const {
    vehicles,
    stores,
    filters,
    searchQuery,
    loadError,
    page,
    totalCount,
    serverPaginated,
  } = await loadInventory(searchParams);

  return (
    <InventoryPageClient
      vehicles={vehicles}
      stores={stores}
      initialFilters={filters}
      initialSearchQuery={searchQuery}
      loadError={loadError}
      page={page}
      totalCount={totalCount}
      serverPaginated={serverPaginated}
    />
  );
}
