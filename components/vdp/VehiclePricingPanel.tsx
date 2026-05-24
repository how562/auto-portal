"use client";

import { useCta } from "@/components/cta/CtaProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { VehicleMathBox } from "@/components/vdp/VehicleMathBox";
import { VehicleVdpCtaBar } from "@/components/vdp/VehicleVdpCtaBar";
import { formatPrice, formatVehicleLabel, formatVehiclePrice } from "@/lib/format";
import { buildVehiclePricingBreakdown } from "@/lib/vdpPricing";
import type { VdpCtaSettingRow } from "@/lib/vdpCtaTypes";
import type { Store, VehicleDetail } from "@/lib/types";

interface VehiclePricingPanelProps {
  vehicle: VehicleDetail;
  store: Store | null;
  vdpCtaSettings: VdpCtaSettingRow[];
}

export function VehiclePricingPanel({
  vehicle,
  store,
  vdpCtaSettings,
}: VehiclePricingPanelProps) {
  const { t } = useLanguage();
  const { openVdpLead } = useLeadCapture();
  const contactTeam = useCta("contact_team");
  const breakdown = buildVehiclePricingBreakdown(vehicle);
  const storeId = store?.id ?? vehicle.store_id ?? null;
  const label = formatVehicleLabel(vehicle);

  return (
    <div className="card-framer overflow-hidden p-0 lg:sticky lg:top-24">
      <div className="border-b border-[var(--line)] bg-white px-5 py-5 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
          {t("vdp.readyToConnect")}
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--ink)] sm:text-4xl">
          {breakdown.hasPrice && breakdown.finalPrice != null
            ? formatPrice(breakdown.finalPrice)
            : formatVehiclePrice(vehicle)}
        </p>
        {breakdown.hasPrice ? (
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
            {t(
              "vdp.math.priceMicrocopy",
              "Includes estimated doc fee. Tax, title, and license extra.",
            )}
          </p>
        ) : null}
        <p className="mt-2 text-sm text-[var(--muted)]">
          {t("vdp.stock", undefined, { number: vehicle.stock_number ?? "—" })}
        </p>
      </div>

      <div className="bg-white px-5 py-5 sm:px-6">
        <VehicleMathBox vehicle={vehicle} />
      </div>

      <div className="border-t border-[var(--line)] bg-white px-5 py-5 sm:px-6">
        <VehicleVdpCtaBar
          vehicle={vehicle}
          store={store}
          storeId={storeId}
          vdpCtaSettings={vdpCtaSettings}
          layout="stack"
        />

        {store?.phone ? (
          <a
            href={`tel:${store.phone.replace(/\D/g, "")}`}
            className="mt-4 flex w-full items-center justify-center rounded-md border border-dashed border-[var(--gold)] py-3.5 text-center text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--cream)]"
          >
            {t("vdp.call", undefined, { phone: store.phone })}
          </a>
        ) : (
          <button
            type="button"
            onClick={() =>
              openVdpLead({
                action: "availability",
                vehicle,
                store,
                storeId,
                shopperIntent: `Contact request for ${label}`,
              })
            }
            className="mt-4 w-full rounded-md border border-dashed border-[var(--gold)] py-3.5 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--cream)]"
          >
            {contactTeam.label}
          </button>
        )}

        <p className="mt-5 text-center text-xs leading-relaxed text-[var(--muted)]">
          {t("vdp.trustCopy")}
        </p>
      </div>
    </div>
  );
}
