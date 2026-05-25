import { PortalExperience } from "@/components/portal/PortalExperience";

import { getCommunityHeroContent } from "@/lib/communityHero";

import { fetchCavenderCommitmentCmsPayload } from "@/lib/cavenderCommitment";

import { fetchPortalVehicles } from "@/lib/vehicles";

import type { Vehicle } from "@/lib/types";



export const dynamic = "force-dynamic";



async function loadPortalData(): Promise<{ vehicles: Vehicle[] }> {
  const vehicles = await fetchPortalVehicles();
  return { vehicles };
}



export default async function Home() {

  const [{ vehicles }, communityHero, commitmentCms] = await Promise.all([
    loadPortalData(),
    getCommunityHeroContent(),
    fetchCavenderCommitmentCmsPayload(),
  ]);



  return (

    <main className="min-h-screen">

      <PortalExperience

        vehicles={vehicles}
        communityHero={communityHero}

        commitmentCms={commitmentCms}

      />

    </main>

  );

}


