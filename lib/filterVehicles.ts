import {
  filterVehiclesByIntent,
  filtersFromShopperSelection,
} from "./inventoryMatch";
import type { SmartMatchRulesCatalog } from "./smartMatchRulesTypes";
import type {
  BudgetRange,
  ConditionFilter,
  ShopperIntent,
  Vehicle,
} from "./types";

/** @deprecated Prefer filterVehiclesByIntent from lib/inventoryMatch. */
export function filterVehicles(
  vehicles: Vehicle[],
  intent: ShopperIntent,
  budget: BudgetRange,
  condition: ConditionFilter,
  catalog?: SmartMatchRulesCatalog,
): Vehicle[] {
  return filterVehiclesByIntent(
    vehicles,
    filtersFromShopperSelection(intent, budget, condition),
    catalog,
  );
}
