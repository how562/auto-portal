import "@/app/homepage-visual.css";
import { PortalExperience } from "@/components/portal/PortalExperience";

import { getCommunityHeroContent } from "@/lib/communityHero";

import { fetchCavenderCommitmentCmsPayload } from "@/lib/cavenderCommitment";
import { fetchFacebookFeed } from "@/lib/facebookFeed";
import { getFacebookPageConfig } from "@/lib/facebookPageConfig";
import { isSocialFeedPlaceholderMode } from "@/lib/socialFeedPlaceholder";

import { fetchHomepageLayout } from "@/lib/homepageLayout";
import { fetchPortalVehicles } from "@/lib/vehicles";

import type { Vehicle } from "@/lib/types";



export const dynamic = "force-dynamic";



async function loadPortalData(): Promise<{ vehicles: Vehicle[] }> {
  const vehicles = await fetchPortalVehicles();
  return { vehicles };
}



export default async function Home() {

  const facebookPage = getFacebookPageConfig();

  const useLiveSocial = !isSocialFeedPlaceholderMode();

  const [{ vehicles }, communityHero, commitmentCms, facebookFeed, homepageLayout] =
    await Promise.all([
      loadPortalData(),
      getCommunityHeroContent(),
      fetchCavenderCommitmentCmsPayload(),
      useLiveSocial ? fetchFacebookFeed() : Promise.resolve(null),
      fetchHomepageLayout(),
    ]);



  return (

    <main className="min-h-screen">

      <PortalExperience

        vehicles={vehicles}
        communityHero={communityHero}

        commitmentCms={commitmentCms}
        facebookPage={facebookPage}
        facebookFeed={facebookFeed}
        homepageLayout={homepageLayout}

      />

    </main>

  );

}


