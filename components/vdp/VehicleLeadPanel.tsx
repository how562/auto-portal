"use client";

import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { formatPrice, formatVehicleLabel } from "@/lib/format";
import type { Store, VehicleDetail } from "@/lib/types";

interface VehicleLeadPanelProps {
  vehicle: VehicleDetail;
  store: Store | null;
}

export function VehicleLeadPanel({ vehicle, store }: VehicleLeadPanelProps) {
  const { openLead } = useLeadCapture();
  const label = formatVehicleLabel(vehicle);
  const storeId = store?.id ?? vehicle.store_id ?? null;

  return (
    <div className="card-framer p-6 lg:sticky lg:top-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
        Ready to connect
      </p>
      <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
        {formatPrice(vehicle.internet_price)}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Stock #{vehicle.stock_number ?? "—"}
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={() =>
            openLead({
              action: "availability",
              vehicle,
              storeId,
              shopperIntent: `Check availability for ${label}`,
            })
          }
          className="w-full rounded-full bg-[var(--ink)] py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--charcoal)]"
        >
          Check Availability
        </button>
        <button
          type="button"
          onClick={() =>
            openLead({
              action: "shortlist",
              vehicle,
              storeId,
              shopperIntent: `Add to shortlist: ${label}`,
            })
          }
          className="w-full rounded-full border border-[var(--line-dark)] py-3.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--cream)]"
        >
          Build My Shortlist
        </button>
        <button
          type="button"
          onClick={() =>
            openLead({
              action: "compare",
              vehicle,
              storeId,
              shopperIntent: `Find similar to ${label}`,
            })
          }
          className="w-full rounded-full border border-[var(--line-dark)] py-3.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--cream)]"
        >
          Compare Similar
        </button>
        {store?.phone ? (
          <a
            href={`tel:${store.phone.replace(/\D/g, "")}`}
            className="mt-2 w-full rounded-full border border-dashed border-[var(--gold)] py-3.5 text-center text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--cream)]"
          >
            Call {store.phone}
          </a>
        ) : (
          <button
            type="button"
            onClick={() =>
              openLead({
                action: "availability",
                vehicle,
                storeId,
                shopperIntent: `Contact request for ${label}`,
              })
            }
            className="mt-2 w-full rounded-full border border-dashed border-[var(--gold)] py-3.5 text-sm font-semibold text-[var(--ink)]"
          >
            Contact our team
          </button>
        )}
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-[var(--muted)]">
        No pressure. Just real options from across our auto group.
      </p>
    </div>
  );
}
