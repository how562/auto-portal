import {
  DEFAULT_INVENTORY_FILTERS,
  filtersToSearchParams,
  type InventoryFilters,
} from "@/lib/inventorySearch";

/** Keyword search uses /inventory?search= (see filterVehiclesByKeywordSearch). */
export function buildInventoryKeywordSearchUrl(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "/inventory";
  const params = new URLSearchParams();
  params.set("search", trimmed);
  return `/inventory?${params.toString()}`;
}

export type HomepageInventorySearchChip =
  | {
      id: string;
      label: string;
      kind: "filters";
      patch: Partial<InventoryFilters>;
    }
  | {
      id: string;
      label: string;
      kind: "keyword";
      query: string;
    };

export const HOMEPAGE_INVENTORY_SEARCH_CHIPS: HomepageInventorySearchChip[] = [
  {
    id: "trucks",
    label: "Trucks",
    kind: "filters",
    patch: { bodyStyle: "truck" },
  },
  {
    id: "suvs",
    label: "SUVs",
    kind: "filters",
    patch: { bodyStyle: "suv" },
  },
  {
    id: "under-30k",
    label: "Under $30K",
    kind: "filters",
    patch: { budget: "under-30k" },
  },
  {
    id: "electric",
    label: "Electric",
    kind: "keyword",
    query: "electric",
  },
  {
    id: "family-ready",
    label: "Family Ready",
    kind: "filters",
    patch: { lifestyle: "family" },
  },
];

export function homepageInventorySearchChipHref(
  chip: HomepageInventorySearchChip,
): string {
  if (chip.kind === "keyword") {
    return buildInventoryKeywordSearchUrl(chip.query);
  }
  const params = filtersToSearchParams({
    ...DEFAULT_INVENTORY_FILTERS,
    ...chip.patch,
  });
  const qs = params.toString();
  return qs ? `/inventory?${qs}` : "/inventory";
}
