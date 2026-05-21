import { PortalExperience } from "@/components/portal/PortalExperience";
import { fetchHomepageData } from "@/lib/homepage";
import { fetchStores } from "@/lib/stores";
import { fetchPortalVehicles } from "@/lib/vehicles";
import type { HomepageSectionData, Store, Vehicle } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadPortalData(): Promise<{
  sections: HomepageSectionData[];
  vehicles: Vehicle[];
  stores: Store[];
  loadError: string | null;
}> {
  try {
    const sections = await fetchHomepageData();
    const storeId = sections[0]?.collection?.store_id;
    const [vehicles, stores] = await Promise.all([
      fetchPortalVehicles(storeId),
      fetchStores(),
    ]);

    return { sections, vehicles, stores, loadError: null };
  } catch (error: unknown) {
    return {
      sections: [],
      vehicles: [],
      stores: [],
      loadError:
        error instanceof Error ? error.message : "Failed to load portal data",
    };
  }
}

export default async function Home() {
  const { sections, vehicles, stores, loadError } = await loadPortalData();

  return (
    <main className="min-h-screen">
      <PortalExperience
        sections={sections}
        vehicles={vehicles}
        stores={stores}
        loadError={loadError}
      />
    </main>
  );
}
