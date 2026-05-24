import { getShopByLifeCount } from "./inventoryMatch";
import type { SmartMatchRulesCatalog } from "./smartMatchRulesTypes";
import type { Vehicle } from "./types";

export type CategoryChoice = import("./lifeFilters").LifeCategoryId;

export function countByCategory(
  vehicles: Vehicle[],
  choice: CategoryChoice,
  catalog?: SmartMatchRulesCatalog,
): number {
  return getShopByLifeCount(vehicles, choice, catalog);
}
