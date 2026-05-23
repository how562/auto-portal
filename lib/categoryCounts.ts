import { countLifeCategory, type LifeCategoryId } from "./lifeFilters";
import type { SmartMatchRulesCatalog } from "./smartMatchRulesTypes";
import type { Vehicle } from "./types";

export type CategoryChoice = LifeCategoryId;

export function countByCategory(
  vehicles: Vehicle[],
  choice: CategoryChoice,
  catalog?: SmartMatchRulesCatalog,
): number {
  return countLifeCategory(vehicles, choice, catalog);
}
