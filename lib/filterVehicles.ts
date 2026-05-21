import type {
  BudgetRange,
  ConditionFilter,
  ShopperIntent,
  Vehicle,
} from "./types";

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

function haystack(vehicle: Vehicle): string {
  return [vehicle.make, vehicle.model, vehicle.trim, vehicle.body_style]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matchesIntent(vehicle: Vehicle, intent: ShopperIntent): boolean {
  if (intent === "any") return true;

  const text = haystack(vehicle);
  const price = vehicle.internet_price ?? 0;

  switch (intent) {
    case "family-suv":
      return text.includes("suv") || text.includes("acadia") || text.includes("yukon");
    case "work-truck":
      return (
        text.includes("truck") ||
        text.includes("sierra") ||
        text.includes("f-150") ||
        text.includes("pickup")
      );
    case "luxury":
      return (
        price >= 45000 ||
        LUXURY_MAKES.some((make) => text.includes(make))
      );
    case "under-30k":
      return price > 0 && price < 30000;
    case "first-time":
      return price > 0 && price < 38000;
    case "fuel-efficient":
      return (
        text.includes("ev") ||
        text.includes("electric") ||
        text.includes("hybrid") ||
        (price > 0 && price < 32000)
      );
    default:
      return true;
  }
}

function matchesBudget(vehicle: Vehicle, budget: BudgetRange): boolean {
  if (budget === "any") return true;
  const price = vehicle.internet_price;
  if (price === null) return false;

  switch (budget) {
    case "under-30k":
      return price < 30000;
    case "30-50k":
      return price >= 30000 && price <= 50000;
    case "50k-plus":
      return price > 50000;
    default:
      return true;
  }
}

function matchesCondition(
  vehicle: Vehicle,
  condition: ConditionFilter,
): boolean {
  if (condition === "either") return true;
  return vehicle.condition === condition;
}

export function filterVehicles(
  vehicles: Vehicle[],
  intent: ShopperIntent,
  budget: BudgetRange,
  condition: ConditionFilter,
): Vehicle[] {
  return vehicles.filter(
    (vehicle) =>
      matchesIntent(vehicle, intent) &&
      matchesBudget(vehicle, budget) &&
      matchesCondition(vehicle, condition),
  );
}
