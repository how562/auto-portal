import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { VehicleDetailView } from "@/components/vdp/VehicleDetailView";
import { brandPageTitle, BRAND_NAME } from "@/lib/brand";
import { formatMetadataTitle, formatVehicleLabel } from "@/lib/format";
import {
  fetchSimilarVehicles,
  fetchStoreById,
  fetchVehicleById,
} from "@/lib/vehicles";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const vehicle = await fetchVehicleById(params.id);
  if (!vehicle) {
    return { title: brandPageTitle("Vehicle not found") };
  }

  const label = formatVehicleLabel(vehicle);
  return {
    title: formatMetadataTitle(vehicle),
    description: `View ${label}—pricing, details, and connect with ${BRAND_NAME}.`,
  };
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const vehicle = await fetchVehicleById(params.id);

  if (!vehicle) {
    notFound();
  }

  const [store, similar] = await Promise.all([
    vehicle.store_id ? fetchStoreById(vehicle.store_id) : Promise.resolve(null),
    fetchSimilarVehicles(vehicle),
  ]);

  return (
    <>
      <PortalHeader />
      <VehicleDetailView vehicle={vehicle} store={store} similar={similar} />
    </>
  );
}
