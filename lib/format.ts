import { BRAND_TITLE_SUFFIX } from "./brand";
import type { Vehicle, VehicleDetail } from "./types";

export function formatPrice(value: number | null): string {
  if (value === null) {
    return "Request price";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileage(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US").format(value) + " mi";
}

export function formatVehicleTitle(vehicle: Vehicle): string {
  const parts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Vehicle";
}

export function formatVehicleLabel(vehicle: Vehicle): string {
  const title = formatVehicleTitle(vehicle);
  const trim = vehicle.trim ? ` ${vehicle.trim}` : "";
  return `${title}${trim}`;
}

export function vehicleDetailPath(id: string): string {
  return `/inventory/${id}`;
}

export function formatMetadataTitle(vehicle: VehicleDetail): string {
  const parts = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(
    Boolean,
  );
  const base = parts.length > 0 ? parts.join(" ") : "Vehicle";
  return `${base} | ${BRAND_TITLE_SUFFIX}`;
}
