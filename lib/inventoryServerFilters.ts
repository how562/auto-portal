import type { InventoryFilters } from "./inventorySearch";

/** Push simple inventory filters to Supabase so list pages stay paginated. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyServerInventoryFilters(query: any, filters: InventoryFilters) {
  let next = query;

  if (filters.storeId !== "all") {
    next = next.eq("store_id", filters.storeId);
  }

  switch (filters.condition) {
    case "new":
      next = next.ilike("condition", "new");
      break;
    case "used":
      next = next.ilike("condition", "used");
      break;
    case "cpo":
      next = next.or(
        "condition.ilike.%certified%,condition.ilike.%cert%,condition.ilike.cpo%",
      );
      break;
    default:
      break;
  }

  switch (filters.budget) {
    case "under-25k":
      next = next.gt("internet_price", 0).lte("internet_price", 25000);
      break;
    case "under-30k":
      next = next.gt("internet_price", 0).lte("internet_price", 30000);
      break;
    case "under-40k":
      next = next.gt("internet_price", 0).lte("internet_price", 40000);
      break;
    case "30-50k":
      next = next.gte("internet_price", 30000).lte("internet_price", 50000);
      break;
    case "50k-plus":
      next = next.gte("internet_price", 50000);
      break;
    default:
      break;
  }

  switch (filters.bodyStyle) {
    case "suv":
      next = next.or(
        "body_style.ilike.%suv%,body_style.ilike.%crossover%,body_style.ilike.%sport utility%",
      );
      break;
    case "truck":
      next = next.or("body_style.ilike.%truck%,body_style.ilike.%pickup%");
      break;
    case "sedan":
      next = next.ilike("body_style", "%sedan%");
      break;
    case "coupe":
      next = next.ilike("body_style", "%coupe%");
      break;
    case "van":
      next = next.or("body_style.ilike.%van%,body_style.ilike.%minivan%");
      break;
    default:
      break;
  }

  return next;
}
