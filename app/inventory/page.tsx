import { Suspense } from "react";
import { InventoryPageClient } from "@/components/inventory/InventoryPageClient";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { brandPageTitle, BRAND_NAME } from "@/lib/brand";
import {
  hasActiveInventoryFilters,
  parseInventoryPage,
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
  const page = parseInventoryPage(readParam(searchParams, "page"));
  const useClientPagination = hasActiveInventoryFilters(filters);

  try {
    const stores = await fetchStores();

    if (useClientPagination) {
      const vehicles = await fetchInventoryVehicles(filters.sort);
      return {
        vehicles,
        stores,
        loadError: null as string | null,
        page,
        totalCount: vehicles.length,
        serverPaginated: false,
      };
    }

    const result = await fetchInventoryVehiclesPage(
      page,
      INVENTORY_PAGE_SIZE,
      filters.sort,
    );

    return {
      vehicles: result.vehicles,
      stores,
      loadError: null as string | null,
      page: result.page,
      totalCount: result.totalCount,
      serverPaginated: true,
    };
  } catch (error: unknown) {
    return {
      vehicles: [],
      stores: [],
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
  const { vehicles, stores, loadError, page, totalCount, serverPaginated } =
    await loadInventory(searchParams);

  return (
    <LeadCaptureProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[var(--cream)] pt-20 text-[var(--muted)]">
            Loading inventory…
          </div>
        }
      >
        <InventoryPageClient
          vehicles={vehicles}
          stores={stores}
          loadError={loadError}
          page={page}
          totalCount={totalCount}
          serverPaginated={serverPaginated}
        />
      </Suspense>
    </LeadCaptureProvider>
  );
}
