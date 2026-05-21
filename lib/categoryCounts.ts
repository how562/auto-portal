import { filterVehicles } from "./filterVehicles";
import type { ShopperIntent, Vehicle } from "./types";

export type CategoryChoice =
  | "family"
  | "work"
  | "luxury"
  | "budget"
  | "first-vehicle"
  | "fuel-efficient";

const CATEGORY_INTENTS: Record<CategoryChoice, ShopperIntent> = {
  family: "family-suv",
  work: "work-truck",
  luxury: "luxury",
  budget: "under-30k",
  "first-vehicle": "first-time",
  "fuel-efficient": "fuel-efficient",
};

export function countByCategory(
  vehicles: Vehicle[],
  choice: CategoryChoice,
): number {
  const intent = CATEGORY_INTENTS[choice];
  return filterVehicles(vehicles, intent, "any", "either").length;
}
