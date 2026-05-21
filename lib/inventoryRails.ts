import { filterVehicles } from "./filterVehicles";
import type {
  BudgetRange,
  ConditionFilter,
  HomepageSectionData,
  ShopperIntent,
  Vehicle,
} from "./types";

export interface InventoryRail {
  id: string;
  title: string;
  subtitle: string;
}

function dedupeVehicles(vehicles: Vehicle[]): Vehicle[] {
  const seen = new Set<string>();
  return vehicles.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });
}

export function buildInventoryRails(
  vehicles: Vehicle[],
  sections: HomepageSectionData[],
  intent: ShopperIntent,
  budget: BudgetRange,
  condition: ConditionFilter,
): Array<InventoryRail & { vehicles: Vehicle[] }> {
  const fromSections = dedupeVehicles(
    sections.flatMap((s) => s.vehicles),
  );

  const bestMatches = filterVehicles(vehicles, intent, budget, condition).slice(
    0,
    12,
  );
  const freshInventory = (
    fromSections.length > 0 ? fromSections : vehicles
  ).slice(0, 12);
  const under30k = filterVehicles(
    vehicles,
    "under-30k",
    "any",
    "either",
  ).slice(0, 12);

  return [
    {
      id: "best-matches",
      title: "Best Matches",
      subtitle: "Tuned to your guided preferences across the group",
      vehicles: bestMatches,
    },
    {
      id: "fresh-inventory",
      title: "Fresh Inventory",
      subtitle: fromSections.length
        ? "Live picks from your curated homepage collections"
        : "Recently surfaced vehicles ready to explore",
      vehicles: freshInventory,
    },
    {
      id: "under-30k",
      title: "Under $30k",
      subtitle: "Value-forward options with transparent pricing",
      vehicles: under30k,
    },
  ];
}
