"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCta } from "@/components/cta/CtaProvider";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { usePortalText } from "@/components/providers/TextSettingsProvider";
import { useSmartMatchRulesCatalog } from "@/components/providers/SmartMatchRulesProvider";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import {
  buildInventoryUrl,
  filtersFromShopperSelection,
  getSmartMatchResults,
} from "@/lib/inventoryMatch";
import { getMatchLabel } from "@/lib/matchLabels";
import {
  getHighlightBadgeLabel,
  getSimilarPicksHeading,
  getVehicleMatchPresentationForShopper,
} from "@/lib/matchReasons";
import type { TranslationKey } from "@/lib/i18n/translations";
import type { BudgetRange, ShopperIntent, Vehicle } from "@/lib/types";
import { btnPrimarySm, btnSecondarySm } from "@/lib/buttonClasses";
import { cardEmptyState, cardPanelPad } from "@/lib/cardClasses";
import { VehicleCard } from "./VehicleCard";

const PREVIEW_LIMIT = 4;

const STEP1_IDS: ShopperIntent[] = [
  "family-suv",
  "work-truck",
  "luxury",
  "under-30k",
  "first-time",
  "fuel-efficient",
];

const STEP2_IDS: BudgetRange[] = ["any", "under-30k", "30-50k", "50k-plus"];

const STEP1_MAP: Record<
  ShopperIntent,
  { label: TranslationKey; desc: TranslationKey }
> = {
  any: { label: "match.any", desc: "match.any" },
  "family-suv": { label: "discovery.intent.family", desc: "discovery.intent.familyDesc" },
  "work-truck": { label: "discovery.intent.work", desc: "discovery.intent.workDesc" },
  luxury: { label: "discovery.intent.luxury", desc: "discovery.intent.luxuryDesc" },
  "under-30k": { label: "discovery.intent.budget", desc: "discovery.intent.budgetDesc" },
  "first-time": {
    label: "discovery.intent.firstTime",
    desc: "discovery.intent.firstTimeDesc",
  },
  "fuel-efficient": {
    label: "discovery.intent.efficiency",
    desc: "discovery.intent.efficiencyDesc",
  },
};

const STEP2_MAP: Record<BudgetRange, TranslationKey> = {
  any: "discovery.budget.flexible",
  "under-30k": "discovery.budget.under30k",
  "30-50k": "discovery.budget.30to50",
  "50k-plus": "discovery.budget.50plus",
};

interface GuidedDiscoverySectionProps {
  vehicles: Vehicle[];
}

export function GuidedDiscoverySection({ vehicles }: GuidedDiscoverySectionProps) {
  const { t, locale } = useLanguage();
  const smartMatchCatalog = useSmartMatchRulesCatalog();
  const browseInventoryCta = useCta("discovery_browse");

  const smartMatchEyebrow = usePortalText(
    "smart_match_eyebrow",
    t("discovery.smartMatch"),
  );
  const smartMatchTitle = usePortalText(
    "smart_match_title",
    t("discovery.refineYourFit"),
  );
  const step1Title = usePortalText(
    "smart_match_step_1_title",
    t("discovery.step1Title"),
  );
  const step1Body = usePortalText(
    "smart_match_step_1_body",
    t("discovery.step1Subtitle"),
  );
  const resultsTitle = usePortalText(
    "smart_match_results_title",
    t("discovery.yourMatches"),
  );
  const resultsBody = usePortalText(
    "smart_match_results_body",
    t("discovery.matchesIntro"),
  );
  const emptyPlaceholder = usePortalText(
    "smart_match_empty",
    t("discovery.completeSteps"),
  );
  const viewAllLabel = usePortalText(
    "smart_match_view_all",
    t("discovery.viewAllMatches"),
  );
  const {
    intent,
    budget,
    condition,
    guidedStep,
    setIntent,
    setBudget,
    setCondition,
    setGuidedStep,
  } = useDiscovery();

  const hasIntent = intent !== "any";

  const matchFilters = useMemo(
    () => filtersFromShopperSelection(intent, budget, condition),
    [intent, budget, condition],
  );

  const matchResult = useMemo(
    () => getSmartMatchResults(vehicles, matchFilters, smartMatchCatalog),
    [vehicles, matchFilters, smartMatchCatalog],
  );

  const matches = matchResult.vehicles;

  const previewMatches = useMemo(
    () => matches.slice(0, PREVIEW_LIMIT),
    [matches],
  );

  const inventoryHref = useMemo(
    () => buildInventoryUrl(matchFilters),
    [matchFilters],
  );

  const matchLabel = getMatchLabel(intent, t);
  const showResults = hasIntent;
  const similarPicks = matchResult.fallbackUsed;
  const resultsHeading = similarPicks
    ? getSimilarPicksHeading(locale)
    : resultsTitle;

  const step1Options = STEP1_IDS.map((id) => ({
    id,
    label: t(STEP1_MAP[id].label),
    desc: t(STEP1_MAP[id].desc),
  }));

  const step2Options = STEP2_IDS.map((id) => ({
    id,
    label: t(STEP2_MAP[id]),
  }));

  return (
    <section
      id="guided-discovery"
      className="scroll-mt-20 relative overflow-hidden border-y border-[var(--line)] bg-white py-16 sm:py-24"
    >
      <div className="portal-container relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              {smartMatchEyebrow}
            </p>
            <h2 className="mt-3 headline-stack text-4xl sm:text-5xl">
              {smartMatchTitle}
            </h2>
          </div>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setGuidedStep(step)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition ${
                  guidedStep === step
                    ? "bg-[var(--ink)] text-white"
                    : guidedStep > step
                      ? "bg-[var(--cream)] text-[var(--ink)]"
                      : "bg-[var(--cream)] text-[var(--muted)] ring-1 ring-[var(--line-dark)]"
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-5">
            {guidedStep === 1 ? (
              <StepPanel
                step={1}
                title={step1Title}
                subtitle={step1Body}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {step1Options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setIntent(opt.id);
                        setGuidedStep(2);
                      }}
                      className={`rounded-md border px-4 py-4 text-left transition-colors duration-200 ${
                        intent === opt.id
                          ? "border-[var(--gold)] bg-[var(--cream)]"
                          : "border-[var(--line-dark)] bg-[var(--cream)] hover:border-[var(--ink)]/35"
                      }`}
                    >
                      <span className="font-semibold text-[var(--ink)]">
                        {opt.label}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--muted)]">
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </StepPanel>
            ) : null}

            {guidedStep === 2 ? (
              <StepPanel
                step={2}
                title={t("discovery.step2Title")}
                subtitle={t("discovery.step2Subtitle")}
              >
                <div className="flex flex-wrap gap-2">
                  {step2Options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setBudget(opt.id);
                        setGuidedStep(3);
                      }}
                      className={`rounded-md px-5 py-3 text-sm font-medium transition ${
                        budget === opt.id
                          ? "bg-[var(--ink)] text-white"
                          : "bg-[var(--cream)] text-[var(--muted)] ring-1 ring-[var(--line-dark)] hover:ring-[var(--ink)]/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </StepPanel>
            ) : null}

            {guidedStep === 3 ? (
              <StepPanel
                step={3}
                title={t("discovery.step3Title")}
                subtitle={t("discovery.step3Subtitle")}
              >
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["either", t("discovery.condition.either")],
                      ["new", t("discovery.condition.new")],
                      ["used", t("discovery.condition.used")],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCondition(value)}
                      className={`rounded-md px-5 py-3 text-sm font-medium transition ${
                        condition === value
                          ? "bg-[var(--ink)] text-white"
                          : "bg-[var(--cream)] text-[var(--muted)] ring-1 ring-[var(--line-dark)] hover:ring-[var(--ink)]/30"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </StepPanel>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <div className={`${cardPanelPad} min-h-[320px]`}>
              {showResults ? (
                <>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
                      {resultsHeading}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                      {similarPicks
                        ? t("discovery.similarPicksIntro")
                        : resultsBody}
                    </p>
                  </div>

                  {previewMatches.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center text-center">
                      <p className={`${cardEmptyState} max-w-md`}>
                        {t("discovery.noMatches")}
                      </p>
                      <Link
                        href={browseInventoryCta.url ?? "/inventory"}
                        className={`${btnPrimarySm} mt-6`}
                      >
                        {browseInventoryCta.label}
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {previewMatches.map((vehicle) => {
                          const presentation =
                            getVehicleMatchPresentationForShopper(
                              vehicle,
                              intent,
                              matchFilters,
                              smartMatchCatalog,
                              locale,
                            );
                          return (
                            <VehicleCard
                              key={vehicle.id}
                              vehicle={vehicle}
                              matchLabel={matchLabel}
                              matchChips={presentation.chips}
                              highlightBadge={presentation.badge}
                              highlightBadgeLabel={
                                presentation.badge
                                  ? getHighlightBadgeLabel(
                                      presentation.badge,
                                      locale,
                                    )
                                  : undefined
                              }
                              variant="rail"
                            />
                          );
                        })}
                      </div>

                      <div className="mt-8 flex flex-col items-stretch gap-3 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-[var(--muted)]">
                          {t("discovery.vehiclesSurfaced", undefined, {
                            count: matches.length,
                          })}
                        </p>
                        <Link
                          href={inventoryHref}
                          className={`${btnSecondarySm} text-center`}
                        >
                          {viewAllLabel}
                        </Link>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-md border border-[var(--line-dark)] bg-[var(--cream-dark)]" />
                  <p className="mt-6 text-lg font-medium text-[var(--ink)]">
                    {emptyPlaceholder}
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                    {t("discovery.stepProgress", undefined, { step: guidedStep })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center border-t border-[var(--line)] pt-10">
          <DiscoveryCTA />
        </div>
      </div>
    </section>
  );
}

function StepPanel({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className={cardPanelPad}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {t("discovery.stepLabel", undefined, { step })}
      </span>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
