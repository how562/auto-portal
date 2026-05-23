import { PortalExperience } from "@/components/portal/PortalExperience";

import { getCommunityHeroContent } from "@/lib/communityHero";

import { fetchCavenderCommitmentCmsPayload } from "@/lib/cavenderCommitment";

import { fetchStores } from "@/lib/stores";

import { fetchPortalVehicles } from "@/lib/vehicles";

import type { Store, Vehicle } from "@/lib/types";



export const dynamic = "force-dynamic";



async function loadPortalData(): Promise<{

  vehicles: Vehicle[];

  stores: Store[];

}> {

  const [vehicles, stores] = await Promise.all([

    fetchPortalVehicles(),

    fetchStores(),

  ]);

  return { vehicles, stores };

}



export default async function Home() {

  const [{ vehicles, stores }, communityHero, commitmentCms] = await Promise.all([

    loadPortalData(),

    getCommunityHeroContent(),

    fetchCavenderCommitmentCmsPayload(),

  ]);



  return (

    <main className="min-h-screen">

      <PortalExperience

        vehicles={vehicles}

        stores={stores}

        communityHero={communityHero}

        commitmentCms={commitmentCms}

      />

    </main>

  );

}


