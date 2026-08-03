import {
  applyActiveInventoryProviderFilterSpec,
  getActiveInventoryProviderFilterSpec,
} from "./inventoryActiveSource";
import { getSupabaseAdmin, isSupabaseAdminConfigured } from "./supabaseAdmin";
import type { Vehicle } from "./types";

/**
 * Admin merchandising sort values. These are intentionally separate from
 * the customer-facing sort union so the admin labels never leak into the
 * shopper UI.
 *
 * Stay in sync with `ADMIN_SORT_OPTIONS` in `lib/inventoryDiscovery.ts`.
 */
export type AdminInventorySort =
  | "merchandised"
  | "photos"
  | "needs-attention"
  | "newest-added";

export const DEFAULT_ADMIN_SORT: AdminInventorySort = "merchandised";

interface OrderSpec {
  column: string;
  ascending: boolean;
  nullsFirst: boolean;
}

const ADMIN_VEHICLE_SELECT =
  "id, store_id, vin, year, make, model, trim, condition, body_style, internet_price, msrp, sale_price, mileage, stock_number, primary_image_url, image_urls, dealer_name, image_count, has_images, data_quality_score, created_at, imported_at";

export const ADMIN_INVENTORY_PAGE_SIZE = 25;

/**
 * ORDER BY chain for each admin merchandising sort.
 *
 * The `merchandised` view matches the documented spec exactly:
 *   has_images DESC, image_count DESC, data_quality_score DESC,
 *   internet_price DESC NULLS LAST
 *
 * Mirrors `orderingFor` in `lib/vehicles.ts` so the admin and customer
 * surfaces stay in lockstep. `needs-attention` is the only view that
 * surfaces imageless / low-data rows first — that's its job.
 */
function adminOrderingFor(sort: AdminInventorySort): OrderSpec[] {
  switch (sort) {
    case "photos":
      return [
        { column: "image_count", ascending: false, nullsFirst: false },
        { column: "data_quality_score", ascending: false, nullsFirst: false },
        { column: "internet_price", ascending: false, nullsFirst: false },
      ];
    case "needs-attention":
      return [
        { column: "has_images", ascending: true, nullsFirst: true },
        { column: "data_quality_score", ascending: true, nullsFirst: true },
        { column: "image_count", ascending: true, nullsFirst: true },
        { column: "year", ascending: false, nullsFirst: false },
      ];
    case "newest-added":
      return [
        { column: "imported_at", ascending: false, nullsFirst: false },
        { column: "created_at", ascending: false, nullsFirst: false },
      ];
    case "merchandised":
    default:
      return [
        { column: "has_images", ascending: false, nullsFirst: false },
        { column: "image_count", ascending: false, nullsFirst: false },
        { column: "data_quality_score", ascending: false, nullsFirst: false },
        { column: "internet_price", ascending: false, nullsFirst: false },
      ];
  }
}

export function isAdminInventorySort(value: unknown): value is AdminInventorySort {
  return (
    value === "merchandised" ||
    value === "photos" ||
    value === "needs-attention" ||
    value === "newest-added"
  );
}

export function normalizeAdminInventorySort(
  value: string | null | undefined,
): AdminInventorySort {
  return isAdminInventorySort(value) ? value : DEFAULT_ADMIN_SORT;
}

export interface AdminInventoryPage {
  vehicles: Vehicle[];
  totalCount: number;
  page: number;
  pageSize: number;
  sort: AdminInventorySort;
}

/**
 * Paginated active inventory for the admin merchandising tools.
 *
 * Uses the service-role client so the admin can audit data quality
 * regardless of public RLS policies on the vehicles table.
 */
export async function fetchAdminInventoryPage({
  page = 1,
  pageSize = ADMIN_INVENTORY_PAGE_SIZE,
  sort = DEFAULT_ADMIN_SORT,
}: {
  page?: number;
  pageSize?: number;
  sort?: AdminInventorySort;
} = {}): Promise<AdminInventoryPage> {
  if (!isSupabaseAdminConfigured()) {
    return { vehicles: [], totalCount: 0, page: 1, pageSize, sort };
  }

  const supabase = getSupabaseAdmin();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  const providerSpec = await getActiveInventoryProviderFilterSpec();
  let query = supabase
    .from("vehicles")
    .select(ADMIN_VEHICLE_SELECT, { count: "exact" })
    .eq("status", "active");

  query = applyActiveInventoryProviderFilterSpec(query, providerSpec);

  for (const spec of adminOrderingFor(sort)) {
    query = query.order(spec.column, {
      ascending: spec.ascending,
      nullsFirst: spec.nullsFirst,
    });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    throw new Error(`Failed to load admin inventory: ${error.message}`);
  }

  return {
    vehicles: (data ?? []) as Vehicle[],
    totalCount: count ?? 0,
    page: safePage,
    pageSize,
    sort,
  };
}
