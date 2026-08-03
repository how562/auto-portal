import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { VehicleDetailView } from "@/components/vdp/VehicleDetailView";
import { brandPageTitle, BRAND_NAME } from "@/lib/brand";
import { formatMetadataTitle, formatVehicleLabel } from "@/lib/format";
import { fetchPricingMathboxConfig } from "@/lib/fetchPricingMathboxConfig";
import { fetchVdpCtaSettings } from "@/lib/fetchVdpCtaSettings";
import {
  canonicalVehiclePath,
  getAudienceByKey,
  getAudienceBySiteStoreId,
  isInventoryAudienceKey,
  isInventoryPoolStoreId,
  isSharedPreownedCondition,
  vehicleDetailPathWithAudience,
  type InventoryAudienceKey,
} from "@/lib/inventoryAudiences";
import {
  fetchSimilarVehicles,
  fetchStoreById,
  fetchVehicleById,
} from "@/lib/vehicles";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

function readParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string | undefined {
  const value = searchParams?.[key];
  return typeof value === "string" ? value : undefined;
}

async function resolveAudienceContext(
  searchParams: PageProps["searchParams"],
): Promise<{
  audienceKey: InventoryAudienceKey | null;
  siteStoreId: string | null;
}> {
  const audienceParam = readParam(searchParams, "audience");
  const storeParam = readParam(searchParams, "store");

  if (audienceParam && isInventoryAudienceKey(audienceParam)) {
    const audience = await getAudienceByKey(audienceParam);
    return {
      audienceKey: audienceParam,
      siteStoreId: audience?.site_store_id ?? null,
    };
  }

  if (storeParam) {
    const audience = await getAudienceBySiteStoreId(storeParam);
    if (audience) {
      return {
        audienceKey: audience.audience_key,
        siteStoreId: audience.site_store_id,
      };
    }
    return { audienceKey: null, siteStoreId: storeParam };
  }

  return { audienceKey: null, siteStoreId: null };
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const ctx = await resolveAudienceContext(searchParams);
  const vehicle = await fetchVehicleById(params.id, {
    audienceKey: ctx.audienceKey,
    siteStoreId: ctx.siteStoreId,
  });
  if (!vehicle) {
    return { title: brandPageTitle("Vehicle not found") };
  }

  const label = formatVehicleLabel(vehicle);
  const canonical = canonicalVehiclePath(vehicle);
  return {
    title: formatMetadataTitle(vehicle),
    description: `View ${label}—pricing, details, and connect with ${BRAND_NAME}.`,
    alternates: { canonical },
  };
}

export default async function VehicleDetailPage({
  params,
  searchParams,
}: PageProps) {
  const ctx = await resolveAudienceContext(searchParams);
  const vehicle = await fetchVehicleById(params.id, {
    audienceKey: ctx.audienceKey,
    siteStoreId: ctx.siteStoreId,
  });

  if (!vehicle) {
    // If a new franchise vehicle was opened without / with wrong audience,
    // try redirecting to the matching franchise context when we can resolve it.
    const raw = await fetchVehicleById(params.id, { bypassAudienceGate: true });
    if (
      raw?.store_id &&
      (await isInventoryPoolStoreId(raw.store_id)) &&
      !isSharedPreownedCondition(raw.condition)
    ) {
      const { isJaguarMake, isLandRoverFamilyMake } = await import(
        "@/lib/inventoryAudiences"
      );
      if (isJaguarMake(raw.make)) {
        redirect(vehicleDetailPathWithAudience(raw.id, "jaguar"));
      }
      if (isLandRoverFamilyMake(raw.make, raw.model)) {
        redirect(vehicleDetailPathWithAudience(raw.id, "land_rover"));
      }
    }
    notFound();
  }

  // Display store: prefer public site store for audience context over pool owner.
  const displayStoreId = ctx.siteStoreId;
  const [store, similar, vdpCtaSettings, mathboxConfig] = await Promise.all([
    displayStoreId
      ? fetchStoreById(displayStoreId)
      : vehicle.store_id
        ? fetchStoreById(vehicle.store_id)
        : Promise.resolve(null),
    fetchSimilarVehicles(vehicle, { audienceKey: ctx.audienceKey }),
    fetchVdpCtaSettings(),
    fetchPricingMathboxConfig(),
  ]);

  return (
    <>
      <PortalHeader />
      <VehicleDetailView
        vehicle={vehicle}
        store={store}
        similar={similar}
        vdpCtaSettings={vdpCtaSettings}
        mathboxConfig={mathboxConfig}
        audienceKey={ctx.audienceKey}
        siteStoreId={ctx.siteStoreId}
      />
    </>
  );
}
