import { InventoryPageClient } from "@/components/inventory/InventoryPageClient";
import { loadInventoryPageData } from "@/lib/loadInventoryPage";
import type { SitePage } from "@/lib/cmsTypes";
import { presetToInventoryFilters } from "@/lib/inventorySitePages";

interface InventoryLandingPageViewProps {
  page: SitePage;
  searchParams: Record<string, string | string[] | undefined>;
}

export async function InventoryLandingPageView({
  page,
  searchParams,
}: InventoryLandingPageViewProps) {
  const preset = page.inventory_preset ?? {};
  const {
    vehicles,
    stores,
    filters,
    searchQuery,
    loadError,
    page: pageNum,
    totalCount,
    serverPaginated,
  } = await loadInventoryPageData(searchParams, { preset });

  const basePath = `/${page.slug}`;

  return (
    <InventoryPageClient
      vehicles={vehicles}
      stores={stores}
      initialFilters={filters}
      initialSearchQuery={searchQuery}
      loadError={loadError}
      page={pageNum}
      totalCount={totalCount}
      serverPaginated={serverPaginated}
      basePath={basePath}
      pageTitle={page.title}
      lockedPreset={preset}
      resetFilters={presetToInventoryFilters(preset)}
    />
  );
}
