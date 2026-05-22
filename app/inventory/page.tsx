import { Suspense } from "react";
import { InventoryPageClient } from "@/components/inventory/InventoryPageClient";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { brandPageTitle, BRAND_NAME } from "@/lib/brand";
import { fetchStores } from "@/lib/stores";
import { fetchInventoryVehicles } from "@/lib/vehicles";

export const dynamic = "force-dynamic";

export const metadata = {
  title: brandPageTitle("Find Your Match"),
  description: `A guided discovery experience across ${BRAND_NAME}—curated matches, not a traditional lot listing.`,
};

async function loadInventory() {
  try {
    const [vehicles, stores] = await Promise.all([
      fetchInventoryVehicles(),
      fetchStores(),
    ]);
    return { vehicles, stores, loadError: null as string | null };
  } catch (error: unknown) {
    return {
      vehicles: [],
      stores: [],
      loadError:
        error instanceof Error ? error.message : "Failed to load inventory",
    };
  }
}

export default async function InventoryPage() {
  const { vehicles, stores, loadError } = await loadInventory();

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
        />
      </Suspense>
    </LeadCaptureProvider>
  );
}
