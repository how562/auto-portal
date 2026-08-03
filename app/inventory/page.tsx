import { InventoryPageClient } from "@/components/inventory/InventoryPageClient";
import { brandPageTitle, BRAND_NAME } from "@/lib/brand";
import { loadInventoryPageData } from "@/lib/loadInventoryPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: brandPageTitle("Find Your Match"),
  description: `A guided discovery experience across ${BRAND_NAME}—curated matches, not a traditional lot listing.`,
};

interface InventoryPageProps {
  searchParams: Record<string, string | string[] | undefined>;
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
    audienceByStoreId,
  } = await loadInventoryPageData(searchParams);

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
      audienceByStoreId={audienceByStoreId}
    />
  );
}
