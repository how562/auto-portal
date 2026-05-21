import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { VehicleDetailView } from "@/components/vdp/VehicleDetailView";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
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
    return { title: "Vehicle not found | Auto Group" };
  }

  const label = formatVehicleLabel(vehicle);
  return {
    title: formatMetadataTitle(vehicle),
    description: `View ${label}—pricing, details, and connect with our auto group.`,
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
    <LeadCaptureProvider>
      <PortalHeader />
      <VehicleDetailView vehicle={vehicle} store={store} similar={similar} />
    </LeadCaptureProvider>
  );
}
