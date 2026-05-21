import type { VehicleDetail } from "./types";
import { formatPrice } from "./format";

const LUXURY_MAKES = [
  "cadillac",
  "bmw",
  "mercedes",
  "lexus",
  "audi",
  "porsche",
  "lincoln",
  "genesis",
  "acura",
  "infiniti",
];

function haystack(vehicle: VehicleDetail): string {
  return [
    vehicle.make,
    vehicle.model,
    vehicle.trim,
    vehicle.body_style,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function buildWhyItMayFit(vehicle: VehicleDetail): string[] {
  const paragraphs: string[] = [];
  const text = haystack(vehicle);
  const price = vehicle.internet_price ?? 0;
  const title = [vehicle.year, vehicle.make, vehicle.model]
    .filter(Boolean)
    .join(" ");

  if (
    text.includes("suv") ||
    text.includes("crossover") ||
    text.includes("minivan") ||
    text.includes("van")
  ) {
    paragraphs.push(
      `${title || "This vehicle"} offers the space and flexibility many families and daily drivers look for—room for passengers, gear, and the routines that fill your week.`,
    );
  }

  if (
    text.includes("truck") ||
    text.includes("pickup") ||
    text.includes("sierra") ||
    text.includes("f-150")
  ) {
    paragraphs.push(
      "Built with capability in mind, this path suits work-ready duty cycles, towing confidence, and weekends that still demand a serious machine.",
    );
  }

  if (price > 0 && price < 30000) {
    paragraphs.push(
      `At ${formatPrice(vehicle.internet_price)}, it sits in a value-forward range—transparent pricing without the usual runaround.`,
    );
  }

  const isLuxury =
    price >= 45000 ||
    LUXURY_MAKES.some((make) => text.includes(make)) ||
    (vehicle.trim?.toLowerCase().includes("premium") ?? false) ||
    (vehicle.trim?.toLowerCase().includes("luxury") ?? false);

  if (isLuxury) {
    paragraphs.push(
      "Premium positioning shows in the trim and brand story—an elevated fit if design, comfort, and presence matter to how you drive.",
    );
  }

  if (
    text.includes("hybrid") ||
    text.includes("electric") ||
    text.includes("ev") ||
    (price > 0 && price < 32000 && paragraphs.length < 3)
  ) {
    paragraphs.push(
      "Efficiency-minded shoppers may appreciate lower running costs and a lighter footprint for daily commuting.",
    );
  }

  if (vehicle.condition === "new") {
    paragraphs.push(
      "As new inventory, you get the latest model year experience with factory-backed peace of mind.",
    );
  } else if (vehicle.condition === "used" || vehicle.condition === "cpo") {
    paragraphs.push(
      "Pre-owned inventory can deliver strong value—real savings while still matching how you actually use a vehicle.",
    );
  }

  if (paragraphs.length === 0) {
    paragraphs.push(
      `${title || "This vehicle"} is part of live group inventory—compare paths, connect with a store, and build a shortlist without the usual dealership friction.`,
    );
  }

  return paragraphs.slice(0, 4);
}
