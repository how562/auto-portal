"use client";

import { useState } from "react";
import { VehicleImagePlaceholder } from "@/components/VehicleImagePlaceholder";
import type { VehicleImagePlaceholderSize } from "@/components/VehicleImagePlaceholder";
import { formatVehicleTitle } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { getVehicleImageUrl } from "@/lib/vehicleImage";

export function VehicleImage({
  vehicle,
  large,
  className,
  fetchPriority,
  placeholderSize,
}: {
  vehicle: Vehicle;
  large?: boolean;
  className?: string;
  fetchPriority?: "high" | "low" | "auto";
  placeholderSize?: VehicleImagePlaceholderSize;
}) {
  const title = formatVehicleTitle(vehicle);
  const imageUrl = getVehicleImageUrl(vehicle);
  const [loadFailed, setLoadFailed] = useState(false);

  const size: VehicleImagePlaceholderSize =
    placeholderSize ?? (large ? "hero" : "md");

  if (!imageUrl || loadFailed) {
    return (
      <VehicleImagePlaceholder
        make={vehicle.make}
        model={vehicle.model}
        bodyStyle={vehicle.body_style}
        year={vehicle.year}
        className={className ?? "h-full w-full"}
        size={size}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={title}
      fetchPriority={fetchPriority}
      onError={() => setLoadFailed(true)}
      className={className ?? "h-full w-full object-cover"}
    />
  );
}
