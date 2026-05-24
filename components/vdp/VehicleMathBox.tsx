"use client";

import { useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { formatPrice, NO_PRICE_LABEL } from "@/lib/format";
import {
  buildVehiclePricingBreakdown,
  sumOfferAmounts,
  type ConditionalOffer,
} from "@/lib/vdpPricing";
import type { VehicleDetail } from "@/lib/types";

interface VehicleMathBoxProps {
  vehicle: VehicleDetail;
}

function formatLineAmount(
  value: number | null,
  mode: "credit" | "charge" | "neutral",
): string {
  if (value == null) return "—";
  if (mode === "credit") return `−${formatPrice(value)}`;
  if (mode === "charge") return `+${formatPrice(value)}`;
  return formatPrice(value);
}

function PricingRow({
  label,
  value,
  mode = "neutral",
  bold = false,
}: {
  label: string;
  value: string;
  mode?: "credit" | "charge" | "neutral";
  bold?: boolean;
}) {
  const valueClass =
    mode === "credit"
      ? "text-emerald-700"
      : mode === "charge"
        ? "text-[var(--muted)]"
        : "text-[var(--ink)]";

  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span
        className={`text-sm ${bold ? "font-semibold text-[var(--ink)]" : "text-[var(--muted)]"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm tabular-nums ${bold ? "text-lg font-bold" : "font-semibold"} ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function OfferAccordion({
  title,
  offers,
  defaultOpen = false,
}: {
  title: string;
  offers: ConditionalOffer[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const total = sumOfferAmounts(offers);

  return (
    <div className="border-t border-[var(--line)]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left transition hover:text-[var(--ink)]"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-[var(--ink)]">{title}</span>
        <span className="flex items-center gap-2 text-sm font-semibold tabular-nums text-emerald-700">
          {total > 0 ? `−${formatPrice(total)}` : "See offers"}
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 shrink-0 text-[var(--muted)] transition ${open ? "rotate-180" : ""}`}
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      {open ? (
        <ul className="space-y-3 pb-3">
          {offers.map((offer) => (
            <li
              key={offer.id}
              className="rounded-md bg-[var(--cream)] px-3 py-2.5 text-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-[var(--ink)]">{offer.label}</span>
                <span className="shrink-0 font-semibold tabular-nums text-emerald-700">
                  {offer.amount != null ? `−${formatPrice(offer.amount)}` : "Ask"}
                </span>
              </div>
              {offer.note ? (
                <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                  {offer.note}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function VehicleMathBox({ vehicle }: VehicleMathBoxProps) {
  const { t } = useLanguage();
  const breakdown = buildVehiclePricingBreakdown(vehicle);

  if (!breakdown.hasPrice) {
    return (
      <div className="rounded-lg border border-[var(--line)] bg-[var(--cream)]/60 p-4">
        <p className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          {NO_PRICE_LABEL}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {t(
            "vdp.math.callForPriceBody",
            "Contact our team for current pricing and any incentives you may qualify for.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--line)] bg-[var(--cream)]/40 p-4 sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
        {t("vdp.math.eyebrow", "Price breakdown")}
      </p>

      <div className="mt-3 divide-y divide-[var(--line)]">
        {breakdown.msrp != null ? (
          <PricingRow
            label={t("vdp.math.msrp", "MSRP")}
            value={formatPrice(breakdown.msrp)}
          />
        ) : null}

        {breakdown.dealerDiscount != null && breakdown.dealerDiscount > 0 ? (
          <PricingRow
            label={t("vdp.math.dealerDiscount", "Dealer Discount")}
            value={formatLineAmount(breakdown.dealerDiscount, "credit")}
            mode="credit"
          />
        ) : null}

        <OfferAccordion
          title={t("vdp.math.conditionalOffers", "Conditional Offers")}
          offers={breakdown.conditionalOffers}
        />

        <PricingRow
          label={t("vdp.math.docFee", "Doc Fee")}
          value={formatLineAmount(breakdown.docFee, "charge")}
          mode="charge"
        />

        <PricingRow
          label={t("vdp.math.finalPrice", "Final Price")}
          value={formatPrice(breakdown.finalPrice)}
          bold
        />
      </div>

      <OfferAccordion
        title={t(
          "vdp.math.otherOffers",
          "Other offers you may qualify for",
        )}
        offers={breakdown.otherOffers}
      />

      <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
        {t(
          "vdp.math.microcopy",
          "Price shown before tax, title, and license. Eligibility for conditional offers is confirmed at signing.",
        )}
      </p>

      <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]/90">
        {t(
          "vdp.math.disclaimer",
          "All pricing is subject to change. Conditional incentives require proof of eligibility and may not combine. Doc fee is an estimate; final amount set by the selling store.",
        )}
      </p>
    </div>
  );
}
