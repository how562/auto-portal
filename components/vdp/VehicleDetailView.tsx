import Link from "next/link";
import { VehicleLeadPanel } from "@/components/vdp/VehicleLeadPanel";
import { VehicleCard } from "@/components/portal/VehicleCard";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import {
  formatMileage,
  formatPrice,
  formatVehicleTitle,
} from "@/lib/format";
import { buildWhyItMayFit } from "@/lib/vehicleFitCopy";
import type { Store, Vehicle, VehicleDetail } from "@/lib/types";

interface VehicleDetailViewProps {
  vehicle: VehicleDetail;
  store: Store | null;
  similar: Vehicle[];
}

function HighlightCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--line-dark)] bg-white px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{value}</p>
    </div>
  );
}

export function VehicleDetailView({
  vehicle,
  store,
  similar,
}: VehicleDetailViewProps) {
  const title = formatVehicleTitle(vehicle);
  const fitParagraphs = buildWhyItMayFit(vehicle);
  const storeLabel = store
    ? [store.name, store.city, store.state].filter(Boolean).join(" · ")
    : null;

  function similarInventoryHref(): string {
    const text = (vehicle.body_style ?? "").toLowerCase();
    if (text.includes("suv") || text.includes("crossover")) {
      return "/inventory?body=suv";
    }
    if (text.includes("truck") || text.includes("pickup")) {
      return "/inventory?body=truck";
    }
    if (text.includes("sedan")) {
      return "/inventory?body=sedan";
    }
    if (vehicle.make) {
      return "/inventory";
    }
    return "/inventory";
  }

  const similarHref = similarInventoryHref();

  return (
    <div className="min-h-screen bg-[var(--cream)] pt-20 sm:pt-24">
      <div className="portal-container py-6 sm:py-10">
        <nav
          className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition hover:text-[var(--ink)]">
            Home
          </Link>
          <span aria-hidden>→</span>
          <Link href="/inventory" className="transition hover:text-[var(--ink)]">
            Inventory
          </Link>
          <span aria-hidden>→</span>
          <span className="font-medium text-[var(--ink)]">{title}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-12">
          <div className="space-y-10">
            <section>
              <div className="card-framer overflow-hidden">
                <div className="aspect-[16/10] sm:aspect-[2/1]">
                  <VehicleImage
                    vehicle={vehicle}
                    placeholderSize="hero"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="mt-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
                  {vehicle.condition
                    ? String(vehicle.condition).toUpperCase()
                    : "INVENTORY"}
                </p>
                <h1 className="mt-3 headline-stack text-4xl sm:text-5xl">
                  {title}
                </h1>
                {vehicle.trim ? (
                  <p className="mt-2 text-xl text-[var(--muted)]">{vehicle.trim}</p>
                ) : null}

                <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Price
                    </dt>
                    <dd className="mt-1 text-lg font-semibold">
                      {formatPrice(vehicle.internet_price)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Stock #
                    </dt>
                    <dd className="mt-1 text-lg font-semibold">
                      {vehicle.stock_number ?? "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      Mileage
                    </dt>
                    <dd className="mt-1 text-lg font-semibold">
                      {formatMileage(vehicle.mileage)}
                    </dd>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                      VIN
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-[var(--ink)]">
                      {vehicle.vin ?? "—"}
                    </dd>
                  </div>
                  {storeLabel ? (
                    <div className="col-span-2 sm:col-span-3">
                      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                        Store
                      </dt>
                      <dd className="mt-1 text-lg font-semibold">{storeLabel}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight">
                Vehicle highlights
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <HighlightCard
                  label="Price"
                  value={formatPrice(vehicle.internet_price)}
                />
                <HighlightCard
                  label="Mileage"
                  value={formatMileage(vehicle.mileage)}
                />
                <HighlightCard
                  label="Condition"
                  value={
                    vehicle.condition
                      ? String(vehicle.condition).toUpperCase()
                      : "—"
                  }
                />
                <HighlightCard
                  label="Body style"
                  value={vehicle.body_style ?? "—"}
                />
                <HighlightCard
                  label="Exterior"
                  value={vehicle.exterior_color ?? "—"}
                />
                <HighlightCard
                  label="Interior"
                  value={vehicle.interior_color ?? "—"}
                />
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-[var(--line-dark)] bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Why it may fit
              </h2>
              <div className="mt-6 space-y-4">
                {fitParagraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-base leading-relaxed text-[var(--muted)]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {similar.length > 0 ? (
              <section>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Similar vehicles
                    </h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      Compare more options across the group
                    </p>
                  </div>
                  <Link
                    href={similarHref}
                    className="text-sm font-semibold text-[var(--ink)] hover:underline"
                  >
                    Browse similar →
                  </Link>
                </div>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-2">
                  {similar.map((v) => (
                    <VehicleCard key={v.id} vehicle={v} variant="editorial" />
                  ))}
                </div>
              </section>
            ) : null}

            <div className="flex flex-wrap gap-4 border-t border-[var(--line-dark)] pt-8">
              <Link
                href="/inventory"
                className="rounded-full border border-[var(--line-dark)] bg-white px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
              >
                ← Back to Inventory
              </Link>
              <Link
                href={similarHref}
                className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--charcoal)]"
              >
                Browse similar vehicles
              </Link>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <VehicleLeadPanel vehicle={vehicle} store={store} />
          </aside>
        </div>
      </div>
    </div>
  );
}
