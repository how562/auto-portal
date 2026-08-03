"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { VehicleHighlightBadge } from "@/components/match/VehicleHighlightBadge";
import { MatchReasonChips } from "@/components/match/MatchReasonChips";
import { useSmartMatchRulesCatalog } from "@/components/providers/SmartMatchRulesProvider";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import { VdpSimilarVehicles } from "@/components/vdp/VdpSimilarVehicles";
import { VdpTrustBand } from "@/components/vdp/VdpTrustBand";
import { VdpVinCopy } from "@/components/vdp/VdpVinCopy";
import { VehiclePricingPanel } from "@/components/vdp/VehiclePricingPanel";
import { btnSecondaryMd } from "@/lib/buttonClasses";
import {
  formatConditionLabel,
  formatPrice,
  formatVehiclePrice,
  formatVehicleTitle,
  getVehicleSavingsAmount,
  NO_PRICE_LABEL,
} from "@/lib/format";
import {
  getHighlightBadgeLabel,
  getVehicleMatchPresentation,
} from "@/lib/matchReasons";
import { buildWhyItMayFit } from "@/lib/vehicleFitCopy";
import {
  buildVdpDescriptionParagraphs,
  buildVdpKeyHighlights,
  buildVdpQuickFacts,
} from "@/lib/vdpDisplay";
import type { PricingMathboxConfigRow } from "@/lib/pricingMathboxTypes";
import type { VdpCtaSettingRow } from "@/lib/vdpCtaTypes";
import type { Store, Vehicle, VehicleDetail } from "@/lib/types";

interface VehicleDetailViewProps {
  vehicle: VehicleDetail;
  store: Store | null;
  similar: Vehicle[];
  vdpCtaSettings: VdpCtaSettingRow[];
  mathboxConfig: PricingMathboxConfigRow[];
  audienceKey?: string | null;
  siteStoreId?: string | null;
}

function VdpTitleHeader({
  vehicle,
  badgeLabel,
  badgeKind,
}: {
  vehicle: VehicleDetail;
  badgeLabel: string | null;
  badgeKind: "top-match" | "recommended" | null;
}) {
  const title = formatVehicleTitle(vehicle);
  const savings = getVehicleSavingsAmount(vehicle);
  const priceText = formatVehiclePrice(vehicle);
  const isCallForPrice = priceText === NO_PRICE_LABEL;

  return (
    <header className="mt-6">
      {badgeKind && badgeLabel ? (
        <span className="mb-3 inline-block">
          <VehicleHighlightBadge
            badge={badgeKind}
            label={badgeLabel}
            inline
            className="shadow-sm"
          />
        </span>
      ) : null}
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
        {formatConditionLabel(vehicle.condition)}
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-[var(--ink)] sm:text-3xl lg:text-4xl">
        {title}
      </h1>
      {vehicle.trim ? (
        <p className="mt-1.5 text-base text-[var(--muted)] sm:text-lg">
          {vehicle.trim}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-end gap-3 lg:hidden">
        <p
          className={`font-semibold leading-none tracking-tight text-[var(--ink)] ${
            isCallForPrice ? "text-xl text-[var(--muted)]" : "text-2xl sm:text-3xl"
          }`}
        >
          {priceText}
        </p>
        {savings != null ? (
          <span className="mb-0.5 rounded-full bg-[var(--gold)]/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--ink)]">
            Save {formatPrice(savings)}
          </span>
        ) : null}
      </div>
    </header>
  );
}

function VdpQuickInfoStrip({ vehicle }: { vehicle: VehicleDetail }) {
  const facts = buildVdpQuickFacts(vehicle);

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--line-dark)]/80 bg-white shadow-[var(--shadow-tight)]">
      <dl className="flex min-w-max divide-x divide-[var(--line)] sm:min-w-0 sm:grid sm:grid-cols-5 sm:divide-x sm:divide-y-0">
        {facts.map((fact) => (
          <div key={fact.label} className="px-4 py-3.5 sm:px-5 sm:py-4">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {fact.label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[var(--ink)]">
              {fact.value}
            </dd>
          </div>
        ))}
        {vehicle.vin ? (
          <div className="border-t border-[var(--line)] px-4 py-3.5 sm:col-span-5 sm:border-t sm:px-5 sm:py-3.5">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              VIN
            </dt>
            <dd className="mt-1">
              <VdpVinCopy vin={vehicle.vin} />
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

export function VehicleDetailView({
  vehicle,
  store,
  similar,
  vdpCtaSettings,
  mathboxConfig,
  siteStoreId = null,
}: VehicleDetailViewProps) {
  const { t, locale } = useLanguage();
  const catalog = useSmartMatchRulesCatalog();
  const title = formatVehicleTitle(vehicle);
  const fitParagraphs = buildWhyItMayFit(vehicle);
  const descriptionParagraphs = buildVdpDescriptionParagraphs(
    vehicle,
    fitParagraphs,
  );
  const highlights = buildVdpKeyHighlights(vehicle);
  const presentation = getVehicleMatchPresentation(vehicle, {
    locale,
    catalog,
  });
  const badgeLabel = presentation.badge
    ? getHighlightBadgeLabel(presentation.badge, locale)
    : null;

  const storeLabel = store
    ? [store.name, store.city, store.state].filter(Boolean).join(" · ")
    : vehicle.dealer_name ?? null;

  return (
    <div className="min-h-screen bg-[var(--cream)] pt-[4.75rem] sm:pt-20">
      <div className="portal-container py-5 sm:py-8">
        <nav
          className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition hover:text-[var(--ink)]">
            {t("vdp.home")}
          </Link>
          <span aria-hidden>→</span>
          <Link href="/inventory" className="transition hover:text-[var(--ink)]">
            {t("vdp.inventory")}
          </Link>
          <span aria-hidden>→</span>
          <span className="font-medium text-[var(--ink)]">{title}</span>
        </nav>

        <VdpTitleHeader
          vehicle={vehicle}
          badgeKind={presentation.badge}
          badgeLabel={badgeLabel}
        />

        {/* Above-the-fold: image + conversion panel */}
        <section className="mt-5 grid gap-6 lg:mt-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,22rem)] lg:items-start lg:gap-8">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-lg border border-[var(--line-dark)]/80 bg-[var(--ink)] shadow-[var(--shadow-tight)]">
              <div className="aspect-[4/3] max-h-[min(52vh,380px)] w-full sm:max-h-[400px]">
                <VehicleImage
                  vehicle={vehicle}
                  placeholderSize="hero"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <aside className="min-w-0 lg:col-start-2 lg:row-start-1">
            <VehiclePricingPanel
              vehicle={vehicle}
              store={store}
              vdpCtaSettings={vdpCtaSettings}
              mathboxConfig={mathboxConfig}
              siteStoreId={siteStoreId}
            />
          </aside>
        </section>

        <div id="vehicle-overview" className="mt-10 space-y-12 sm:space-y-14">
          <VdpQuickInfoStrip vehicle={vehicle} />

          {presentation.chips.length > 0 ? (
            <section className="rounded-lg border border-[var(--line-dark)]/80 bg-white px-5 py-6 shadow-[var(--shadow-tight)] sm:px-8 sm:py-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">
                {t("vdp.match.eyebrow", "Smart Match")}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
                {t("vdp.match.headline", "Why this vehicle fits you")}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                {t(
                  "vdp.match.body",
                  "Based on how you shop and what this vehicle offers—here is what stood out.",
                )}
              </p>
              <MatchReasonChips
                chips={presentation.chips}
                maxVisible={3}
                variant="subtle"
                className="mt-4"
              />
            </section>
          ) : null}

          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
            <div className="rounded-lg border border-[var(--line-dark)]/80 bg-white p-6 shadow-[var(--shadow-tight)] sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
                {t("vdp.overview", "Overview")}
              </h2>
              <div className="mt-5 space-y-4">
                {descriptionParagraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 48)}
                    className="text-sm leading-relaxed text-[var(--muted)] sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              {storeLabel ? (
                <p className="mt-6 border-t border-[var(--line)] pt-4 text-sm text-[var(--muted)]">
                  <span className="font-semibold text-[var(--ink)]">
                    {t("vdp.store")}:{" "}
                  </span>
                  {storeLabel}
                </p>
              ) : null}
            </div>

            <div className="rounded-lg border border-[var(--line-dark)]/80 bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-tight)] sm:p-8">
              <h2 className="text-lg font-semibold tracking-tight">
                {t("vdp.highlights", "Key highlights")}
              </h2>
              <ul className="mt-5 space-y-3">
                {highlights.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-xs uppercase tracking-[0.14em] text-white/55">
                      {item.label}
                    </span>
                    <span className="text-right text-sm font-medium text-white">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Suspense
            fallback={
              <div className="h-32 animate-pulse rounded-lg bg-[var(--cream-dark)]" />
            }
          >
            <VdpSimilarVehicles vehicle={vehicle} similar={similar} />
          </Suspense>

          <VdpTrustBand />

          <div className="flex flex-wrap gap-3 border-t border-[var(--line-dark)] pt-8">
            <Link href="/inventory" className={btnSecondaryMd}>
              {t("vdp.backToInventory")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
