import type { Vehicle } from "./types";

/** Customer-facing price: internet_price, then msrp, else null (never 0). */
export function getEffectivePrice(
  vehicle: Pick<Vehicle, "internet_price" | "msrp">,
): number | null {
  if (
    typeof vehicle.internet_price === "number" &&
    Number.isFinite(vehicle.internet_price) &&
    vehicle.internet_price > 0
  ) {
    return vehicle.internet_price;
  }
  if (
    typeof vehicle.msrp === "number" &&
    Number.isFinite(vehicle.msrp) &&
    vehicle.msrp > 0
  ) {
    return vehicle.msrp;
  }
  return null;
}
