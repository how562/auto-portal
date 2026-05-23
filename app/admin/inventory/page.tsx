import Link from "next/link";
import { AdminInventorySortControls } from "@/components/admin/AdminInventorySortControls";
import { AdminInventoryTable } from "@/components/admin/AdminInventoryTable";
import {
  ADMIN_INVENTORY_PAGE_SIZE,
  fetchAdminInventoryPage,
  normalizeAdminInventorySort,
  type AdminInventorySort,
} from "@/lib/adminInventory";
import { isSupabaseAdminConfigured } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

interface AdminInventoryPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function readParam(
  searchParams: AdminInventoryPageProps["searchParams"],
  key: string,
): string | undefined {
  const value = searchParams[key];
  return typeof value === "string" ? value : undefined;
}

function buildHrefFor(sort: AdminInventorySort, page = 1): string {
  const params = new URLSearchParams();
  params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/admin/inventory?${qs}` : "/admin/inventory";
}

export default async function AdminInventoryPage({
  searchParams,
}: AdminInventoryPageProps) {
  const configured = isSupabaseAdminConfigured();
  const sort = normalizeAdminInventorySort(readParam(searchParams, "sort"));
  const requestedPage = Number.parseInt(readParam(searchParams, "page") ?? "1", 10);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const result = configured
    ? await fetchAdminInventoryPage({ page, sort })
    : { vehicles: [], totalCount: 0, page, pageSize: ADMIN_INVENTORY_PAGE_SIZE, sort };

  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));
  const safePage = Math.min(Math.max(1, result.page), totalPages);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Inventory management
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Merchandising</h1>
        <p className="max-w-2xl text-sm text-[var(--muted)]">
          Audit how the customer-facing portal ranks vehicles. Switch between
          merchandising views to fix gaps in photos and data quality. These
          sort labels are admin-only and never appear on the shopper site.
        </p>
      </header>

      {!configured ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to <code>.env.local</code>{" "}
          to load inventory in the admin tools.
        </p>
      ) : null}

      <AdminInventorySortControls
        current={sort}
        buildHref={(nextSort) => buildHrefFor(nextSort, 1)}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--ink)]">
              {result.totalCount.toLocaleString()}
            </span>{" "}
            active{" "}
            {result.totalCount === 1 ? "vehicle" : "vehicles"} · page {safePage}{" "}
            of {totalPages}
          </p>
          <p className="text-xs text-[var(--muted)]">
            Showing {result.vehicles.length} per page
          </p>
        </div>

        <AdminInventoryTable vehicles={result.vehicles} />

        {totalPages > 1 ? (
          <div className="flex items-center justify-between pt-2">
            <PaginationLink
              label="← Previous"
              href={buildHrefFor(sort, safePage - 1)}
              disabled={safePage <= 1}
            />
            <PaginationLink
              label="Next →"
              href={buildHrefFor(sort, safePage + 1)}
              disabled={safePage >= totalPages}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PaginationLink({
  label,
  href,
  disabled,
}: {
  label: string;
  href: string;
  disabled: boolean;
}) {
  if (disabled) {
    return (
      <span className="rounded-md border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)] opacity-50">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-md border border-[var(--line-dark)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
    >
      {label}
    </Link>
  );
}
