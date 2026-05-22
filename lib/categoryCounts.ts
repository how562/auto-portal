import { countVehiclesForShopByLife, type ShopByLifeChoice } from "./inventoryMatch";
import type { SmartMatchRulesCatalog } from "./smartMatchRulesTypes";
import type { Vehicle } from "./types";

export type CategoryChoice = ShopByLifeChoice;

export function countByCategory(
  vehicles: Vehicle[],
  choice: CategoryChoice,
  catalog?: SmartMatchRulesCatalog,
): number {
  return countVehiclesForShopByLife(vehicles, choice, catalog);
}
