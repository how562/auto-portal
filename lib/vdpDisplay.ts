import {
  formatConditionLabel,
  formatMileage,
  formatPrice,
  getVehicleSavingsAmount,
} from "./format";
import type { Vehicle, VehicleDetail } from "./types";

export function isUsedVehicle(
  condition: string | null | undefined,
): boolean {
  if (!condition) return false;
  const c = condition.trim().toLowerCase();
  if (c === "new") return false;
  if (c.includes("cert") || c === "cpo") return true;
  return c === "used" || c.length > 0;
}

function specHaystack(vehicle: VehicleDetail): string {
  return [vehicle.trim, vehicle.model, vehicle.body_style]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function inferTransmissionLabel(vehicle: VehicleDetail): string {
  const text = specHaystack(vehicle);
  if (/\b(cvt|continuously variable)\b/i.test(text)) return "CVT";
  if (/\b(auto|automatic|a\/t|at)\b/i.test(text)) return "Automatic";
  if (/\b(manual|m\/t|mt|stick)\b/i.test(text)) return "Manual";
  return "—";
}

export function inferDrivetrainLabel(vehicle: VehicleDetail): string {
  const text = specHaystack(vehicle);
  if (/\b(4x4|4wd|four[- ]?wheel)\b/i.test(text)) return "4WD";
  if (/\b(awd|all[- ]?wheel)\b/i.test(text)) return "AWD";
  if (/\b(fwd|front[- ]?wheel)\b/i.test(text)) return "FWD";
  if (/\b(rwd|rear[- ]?wheel)\b/i.test(text)) return "RWD";
  return "—";
}

export interface VdpQuickFact {
  label: string;
  value: string;
}

export function buildVdpQuickFacts(vehicle: VehicleDetail): VdpQuickFact[] {
  return [
    { label: "Mileage", value: formatMileage(vehicle.mileage) },
    { label: "Condition", value: formatConditionLabel(vehicle.condition) },
    { label: "Transmission", value: inferTransmissionLabel(vehicle) },
    { label: "Drivetrain", value: inferDrivetrainLabel(vehicle) },
    {
      label: "Stock #",
      value: vehicle.stock_number?.trim() ? vehicle.stock_number : "—",
    },
  ];
}

export interface VdpHighlight {
  label: string;
  value: string;
}

export function buildVdpKeyHighlights(vehicle: VehicleDetail): VdpHighlight[] {
  const items: VdpHighlight[] = [];
  if (vehicle.body_style?.trim()) {
    items.push({ label: "Body style", value: vehicle.body_style });
  }
  if (vehicle.exterior_color?.trim()) {
    items.push({ label: "Exterior", value: vehicle.exterior_color });
  }
  if (vehicle.interior_color?.trim()) {
    items.push({ label: "Interior", value: vehicle.interior_color });
  }
  if (vehicle.year) {
    items.push({ label: "Model year", value: String(vehicle.year) });
  }
  const savings = getVehicleSavingsAmount(vehicle);
  if (savings != null) {
    items.push({
      label: "Your advantage",
      value: `${formatPrice(savings)} below MSRP`,
    });
  }
  if (vehicle.dealer_name?.trim()) {
    items.push({ label: "Available at", value: vehicle.dealer_name });
  }
  return items.slice(0, 6);
}

export function buildVdpDescriptionParagraphs(
  vehicle: VehicleDetail,
  fitParagraphs: string[],
): string[] {
  if (fitParagraphs.length > 0) return fitParagraphs;
  const title = [vehicle.year, vehicle.make, vehicle.model]
    .filter(Boolean)
    .join(" ");
  return [
    `${title || "This vehicle"} is available across our group inventory with transparent pricing and a team ready to help you compare options with confidence.`,
  ];
}
