import { BRAND_TITLE_SUFFIX } from "./brand";
import type { Vehicle, VehicleDetail } from "./types";

/** Copy used everywhere a vehicle has no usable price to display. */
export const NO_PRICE_LABEL = "Call for Price";

/**
 * Treat 0, blank, NaN, and `null`/`undefined` as "no price". Used by
 * both the importer and the display helpers so $0 can never leak into
 * the UI.
 */
export function isUsablePrice(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Format a single numeric price. Returns "Call for Price" for any
 * non-positive / missing value so downstream UI never has to guard.
 */
export function formatPrice(value: number | null | undefined): string {
  if (!isUsablePrice(value)) return NO_PRICE_LABEL;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export interface EffectiveVehiclePrice {
  /** The numeric price chosen for display, or `null` when nothing usable. */
  amount: number | null;
  /** Which source was picked, useful for "MSRP" labeling on the UI. */
  source: "internet" | "msrp" | null;
}

/**
 * Resolve which price a vehicle should display.
 *
 * Priority: `internet_price` (if > 0) → `msrp` (if > 0) → none.
 * Stays in lockstep with the SQL backfill in
 * `supabase/migrations/20260523150000_vehicle_pricing_split.sql`.
 */
export function getEffectiveVehiclePrice(
  vehicle: Pick<Vehicle, "internet_price" | "msrp">,
): EffectiveVehiclePrice {
  if (isUsablePrice(vehicle.internet_price)) {
    return { amount: vehicle.internet_price, source: "internet" };
  }
  if (isUsablePrice(vehicle.msrp)) {
    return { amount: vehicle.msrp, source: "msrp" };
  }
  return { amount: null, source: null };
}

/**
 * Display-ready price string for a vehicle. Falls back through the
 * effective-price chain and returns "Call for Price" when nothing
 * usable is available.
 */
export function formatVehiclePrice(
  vehicle: Pick<Vehicle, "internet_price" | "msrp">,
): string {
  const effective = getEffectiveVehiclePrice(vehicle);
  return effective.amount === null
    ? NO_PRICE_LABEL
    : formatPrice(effective.amount);
}

/** Savings when MSRP exceeds internet price (customer-facing badge only). */
export function getVehicleSavingsAmount(
  vehicle: Pick<Vehicle, "internet_price" | "msrp">,
): number | null {
  if (
    isUsablePrice(vehicle.internet_price) &&
    isUsablePrice(vehicle.msrp) &&
    vehicle.msrp > vehicle.internet_price
  ) {
    return vehicle.msrp - vehicle.internet_price;
  }
  return null;
}

export function formatConditionLabel(condition: string | null | undefined): string {
  if (!condition?.trim()) return "—";
  const c = condition.trim().toLowerCase();
  if (c.includes("cert")) return "Certified";
  if (c === "new") return "New";
  if (c === "used") return "Pre-owned";
  return condition.trim();
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
