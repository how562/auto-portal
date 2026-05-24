"use client";

import { useCta } from "@/components/cta/CtaProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { formatVehicleLabel } from "@/lib/format";
import { isUsedVehicle } from "@/lib/vdpDisplay";
import type { VehicleDetail } from "@/lib/types";
import {
  btnAccentMd,
  btnPrimaryLg,
  btnPrimaryMd,
  btnSecondaryMd,
} from "@/lib/buttonClasses";

interface VehicleVdpCtaBarProps {
  vehicle: VehicleDetail;
  storeId: string | null;
  layout?: "bar" | "stack";
}

export function VehicleVdpCtaBar({
  vehicle,
  storeId,
  layout = "bar",
}: VehicleVdpCtaBarProps) {
  const { t } = useLanguage();
  const { openLead } = useLeadCapture();
  const availability = useCta("availability");
  const label = formatVehicleLabel(vehicle);
  const used = isUsedVehicle(vehicle.condition);
  const isNew = !used;

  const paymentLabel = t("vdp.cta.calculatePayment", "Calculate My Payment");
  const tradeLabel = t("vdp.cta.valueTrade", "Value My Trade");
  const ePriceLabel = t("vdp.cta.ePrice", "Get E-Price");
  const unlockLabel = t("vdp.cta.unlockSavings", "Unlock Savings");
  const whyLeaseLabel = t("vdp.cta.whyLease", "Why Lease");
  const exploreLabel = t("vdp.cta.exploreDetails", "Explore Details");

  function lead(shopperIntent: string) {
    openLead({
      action: "availability",
      vehicle,
      storeId,
      shopperIntent,
    });
  }

  const isStack = layout === "stack";
  const primaryBtn = isStack ? btnPrimaryLg : btnPrimaryMd;
  const widthClass = isStack ? "w-full" : "w-full lg:w-auto lg:min-w-[11rem]";
  const secondaryWidth = isStack ? "w-full" : "w-full sm:w-auto";

  return (
    <div
      className={
        isStack
          ? "flex flex-col gap-2.5"
          : "flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center"
      }
    >
      <button
        type="button"
        onClick={() => lead(`Calculate my payment for ${label}`)}
        className={`${primaryBtn} ${widthClass}`}
      >
        {paymentLabel}
      </button>

      <button
        type="button"
        onClick={() => lead(`Check availability for ${label}`)}
        className={`${btnSecondaryMd} ${secondaryWidth}`}
      >
        {availability.label}
      </button>

      {used ? (
        <button
          type="button"
          onClick={() => lead(`Value my trade — interested in ${label}`)}
          className={`${btnAccentMd} ${secondaryWidth}`}
        >
          {tradeLabel}
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => lead(`Request e-price / unlock savings for ${label}`)}
        className={`${btnSecondaryMd} ${secondaryWidth}`}
      >
        {used ? unlockLabel : ePriceLabel}
      </button>

      {isNew ? (
        <button
          type="button"
          onClick={() => lead(`Why lease — interested in ${label}`)}
          className={`${btnSecondaryMd} border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] ${secondaryWidth}`}
        >
          {whyLeaseLabel}
        </button>
      ) : null}

      {!isStack ? (
        <a
          href="#vehicle-overview"
          className={`${btnSecondaryMd} w-full text-center sm:w-auto lg:ml-auto`}
        >
          {exploreLabel}
        </a>
      ) : null}
    </div>
  );
}
