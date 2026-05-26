"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { btnSecondarySm } from "@/lib/buttonClasses";
import {
  formatVehiclePrice,
  formatVehicleTitle,
  getEffectiveVehiclePrice,
  vehicleDetailPath,
  NO_PRICE_LABEL,
} from "@/lib/format";
import { VehicleImage } from "@/components/vehicle/VehicleImage";
import { MatchReasonChips } from "@/components/match/MatchReasonChips";

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

const STEP1_MAP: Record<ShopperIntent, { label: TranslationKey; desc: TranslationKey }> = {
  any:             { label: "match.any",                  desc: "match.any" },
  "family-suv":    { label: "discovery.intent.family",    desc: "discovery.intent.familyDesc" },
  "work-truck":    { label: "discovery.intent.work",      desc: "discovery.intent.workDesc" },
  luxury:          { label: "discovery.intent.luxury",    desc: "discovery.intent.luxuryDesc" },
  "under-30k":     { label: "discovery.intent.budget",   desc: "discovery.intent.budgetDesc" },
  "first-time":    { label: "discovery.intent.firstTime", desc: "discovery.intent.firstTimeDesc" },
  "fuel-efficient":{ label: "discovery.intent.efficiency",desc: "discovery.intent.efficiencyDesc" },
};

const STEP2_MAP: Record<BudgetRange, TranslationKey> = {
  any:         "discovery.budget.flexible",
  "under-30k": "discovery.budget.under30k",
  "30-50k":    "discovery.budget.30to50",
  "50k-plus":  "discovery.budget.50plus",
};

/* Preview count for a hovered intent, without budget/condition filter */
function useHoverCount(
  vehicles: Vehicle[],
  hoveredIntent: ShopperIntent | null,
  smartMatchCatalog: ReturnType<typeof useSmartMatchRulesCatalog>,
) {
  return useMemo(() => {
    if (!hoveredIntent) return null;
    const filters = filtersFromShopperSelection(hoveredIntent, "any", "either");
    const result = getSmartMatchResults(vehicles, filters, smartMatchCatalog);
    return result.vehicles.length;
  }, [hoveredIntent, vehicles, smartMatchCatalog]);
}

interface GuidedDiscoverySectionProps { vehicles: Vehicle[] }

export function GuidedDiscoverySection({ vehicles }: GuidedDiscoverySectionProps) {
  const { t, locale } = useLanguage();
  const smartMatchCatalog = useSmartMatchRulesCatalog();

  const smartMatchEyebrow = usePortalText("smart_match_eyebrow", t("discovery.smartMatch"));
  const smartMatchTitle   = usePortalText("smart_match_title",   t("discovery.refineYourFit"));
  const resultsTitle      = usePortalText("smart_match_results_title", t("discovery.yourMatches"));
  const viewAllLabel      = usePortalText("smart_match_view_all", t("discovery.viewAllMatches"));

  const {
    intent, budget, condition,
    guidedStep, setIntent, setBudget, setCondition, setGuidedStep,
  } = useDiscovery();

  const [hoveredIntent, setHoveredIntent] = useState<ShopperIntent | null>(null);
  const hoverCount = useHoverCount(vehicles, hoveredIntent, smartMatchCatalog);

  const hasIntent = intent !== "any";
  const hasBudget = budget !== "any";

  const matchFilters   = useMemo(() => filtersFromShopperSelection(intent, budget, condition), [intent, budget, condition]);
  const matchResult    = useMemo(() => getSmartMatchResults(vehicles, matchFilters, smartMatchCatalog), [vehicles, matchFilters, smartMatchCatalog]);
  const matches        = matchResult.vehicles;
  const previewMatches = useMemo(() => matches.slice(0, PREVIEW_LIMIT), [matches]);
  const inventoryHref  = useMemo(() => buildInventoryUrl(matchFilters), [matchFilters]);
  const matchLabel     = getMatchLabel(intent, t);
  const similarPicks   = matchResult.fallbackUsed;
  const resultsHeading = similarPicks ? getSimilarPicksHeading(locale) : resultsTitle;

  const step1Options = STEP1_IDS.map((id) => ({ id, label: t(STEP1_MAP[id].label), desc: t(STEP1_MAP[id].desc) }));
  const step2Options = STEP2_IDS.map((id) => ({ id, label: t(STEP2_MAP[id]) }));

  const intentLabel = hasIntent ? (step1Options.find((o) => o.id === intent)?.label ?? "") : "";
  const budgetLabel = hasBudget ? (step2Options.find((o) => o.id === budget)?.label ?? "") : "";

  /* Currently hovered intent's desc (for prompt copy) */
  const hoveredDesc = hoveredIntent ? (step1Options.find((o) => o.id === hoveredIntent)?.desc ?? "") : "";

  return (
    <section
      id="guided-discovery"
      className="homepage-refine-section scroll-mt-20 relative overflow-hidden"
    >
      <div className="portal-container relative">

        {/* ── Header ── */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              {smartMatchEyebrow}
            </p>
            <h2 className="mt-1.5 font-sans text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
              {smartMatchTitle}
            </h2>
          </div>

          {/* Breadcrumb trail — shows once something chosen */}
          {hasIntent && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 sm:mt-0">
              <button type="button" onClick={() => setGuidedStep(1)} className="gd-crumb">{intentLabel}</button>
              {hasBudget && (
                <><ChevronRight /><button type="button" onClick={() => setGuidedStep(2)} className="gd-crumb">{budgetLabel}</button></>
              )}
              {condition !== "either" && (
                <><ChevronRight /><span className="gd-crumb gd-crumb--static">{condition === "new" ? t("discovery.condition.new") : t("discovery.condition.used")}</span></>
              )}
              <button
                type="button"
                onClick={() => { setIntent("any"); setBudget("any"); setCondition("either"); setGuidedStep(1); }}
                className="ml-1 text-[11px] text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
                aria-label="Clear selections"
              >
                ✕ Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Guided strip ── */}
        <div className="mt-5 overflow-hidden rounded-xl border border-[var(--line-dark)] bg-white shadow-[0_2px_16px_rgba(9,33,63,0.06)]">

          {/* ── STEP 1 ── */}
          <div className={`px-5 py-4 transition-colors duration-200 ${guidedStep !== 1 ? "cursor-pointer hover:bg-[var(--cream)]/50" : ""}`}
               onClick={guidedStep !== 1 ? () => setGuidedStep(1) : undefined}>

            <div className="flex items-center gap-3">
              <StepBubble n={1} active={guidedStep === 1} done={hasIntent} />
              <span className="text-sm font-semibold text-[var(--ink)]">What are you looking for?</span>
              {guidedStep !== 1 && intentLabel && (
                <span className="ml-auto rounded-full bg-[var(--cream-dark)] px-3 py-0.5 text-[11px] font-semibold text-[var(--ink)]">
                  {intentLabel}
                </span>
              )}
              {guidedStep === 1 && !hasIntent && (
                /* Pulsing "tap a chip" hint */
                <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)] gd-tap-hint" aria-hidden>
                  <TapArrow /> tap one to start
                </span>
              )}
            </div>

            {guidedStep === 1 && (
              <div className="mt-4 space-y-3">
                {/* Live hover hint line */}
                <p className="gd-hint-line min-h-[1.25rem] text-[12px] text-[var(--muted)] transition-all duration-200">
                  {hoveredDesc || "Choose the driving lifestyle that fits you best — we'll match your inventory instantly."}
                </p>

                {/* Pill grid with hover count preview */}
                <div className="flex flex-wrap gap-2">
                  {step1Options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onMouseEnter={() => setHoveredIntent(opt.id)}
                      onMouseLeave={() => setHoveredIntent(null)}
                      onFocus={() => setHoveredIntent(opt.id)}
                      onBlur={() => setHoveredIntent(null)}
                      onClick={() => { setIntent(opt.id); setGuidedStep(2); setHoveredIntent(null); }}
                      className={`gd-pill ${intent === opt.id ? "gd-pill--active" : ""}`}
                    >
                      {opt.label}
                      {/* Live count badge on hover */}
                      {hoveredIntent === opt.id && hoverCount !== null && (
                        <span className="gd-pill-count">{hoverCount}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Arrow pointing at chips — animates in only when nothing selected */}
                {!hasIntent && (
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--gold)]">
                    <span className="gd-pulse-dot" aria-hidden /> Select a category above to reveal matching vehicles
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── STEP 2 — unlocked after intent ── */}
          {hasIntent ? (
            <>
              <div className="mx-5 h-px bg-[var(--line)]" />
              <div
                className={`px-5 py-4 transition-colors duration-200 ${guidedStep !== 2 ? "cursor-pointer hover:bg-[var(--cream)]/50" : ""}`}
                onClick={guidedStep !== 2 ? () => setGuidedStep(2) : undefined}
              >
                <div className="flex items-center gap-3">
                  <StepBubble n={2} active={guidedStep === 2} done={hasBudget} />
                  <span className="text-sm font-semibold text-[var(--ink)]">What's your budget?</span>
                  {guidedStep !== 2 && budgetLabel && (
                    <span className="ml-auto rounded-full bg-[var(--cream-dark)] px-3 py-0.5 text-[11px] font-semibold text-[var(--ink)]">{budgetLabel}</span>
                  )}
                  {guidedStep === 2 && !hasBudget && (
                    <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)] gd-tap-hint" aria-hidden>
                      <TapArrow /> pick a range
                    </span>
                  )}
                </div>

                {guidedStep === 2 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-[12px] text-[var(--muted)]">
                      Narrowing by budget helps us surface the most realistic options for you.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step2Options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => { setBudget(opt.id); setGuidedStep(3); }}
                          className={`gd-pill ${budget === opt.id ? "gd-pill--active" : ""}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {!hasBudget && (
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--gold)]">
                        <span className="gd-pulse-dot" aria-hidden /> Pick a budget to keep narrowing
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Locked step 2 — shown greyed so user sees what's coming */
            <>
              <div className="mx-5 h-px bg-[var(--line)]" />
              <div className="flex items-center gap-3 px-5 py-4 opacity-35 select-none">
                <StepBubble n={2} active={false} done={false} />
                <span className="text-sm font-semibold text-[var(--ink)]">What's your budget?</span>
                <span className="ml-auto text-[11px] text-[var(--muted)]">unlocks next</span>
              </div>
            </>
          )}

          {/* ── STEP 3 — unlocked after budget ── */}
          {hasBudget ? (
            <>
              <div className="mx-5 h-px bg-[var(--line)]" />
              <div
                className={`px-5 py-4 transition-colors duration-200 ${guidedStep !== 3 ? "cursor-pointer hover:bg-[var(--cream)]/50" : ""}`}
                onClick={guidedStep !== 3 ? () => setGuidedStep(3) : undefined}
              >
                <div className="flex items-center gap-3">
                  <StepBubble n={3} active={guidedStep === 3} done={condition !== "either"} />
                  <span className="text-sm font-semibold text-[var(--ink)]">New, used, or either?</span>
                  {guidedStep !== 3 && condition !== "either" && (
                    <span className="ml-auto rounded-full bg-[var(--cream-dark)] px-3 py-0.5 text-[11px] font-semibold text-[var(--ink)]">
                      {condition === "new" ? t("discovery.condition.new") : t("discovery.condition.used")}
                    </span>
                  )}
                  {guidedStep === 3 && (
                    <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)] gd-tap-hint" aria-hidden>
                      <TapArrow /> optional — defaults to either
                    </span>
                  )}
                </div>

                {guidedStep === 3 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-[12px] text-[var(--muted)]">
                      Optional. Leave on "Either" and we'll show you the full range.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          ["either", t("discovery.condition.either")],
                          ["new",    t("discovery.condition.new")],
                          ["used",   t("discovery.condition.used")],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setCondition(value)}
                          className={`gd-pill ${condition === value ? "gd-pill--active" : ""}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : !hasIntent ? (
            /* Locked step 3 */
            <>
              <div className="mx-5 h-px bg-[var(--line)]" />
              <div className="flex items-center gap-3 px-5 py-4 opacity-35 select-none">
                <StepBubble n={3} active={false} done={false} />
                <span className="text-sm font-semibold text-[var(--ink)]">New, used, or either?</span>
                <span className="ml-auto text-[11px] text-[var(--muted)]">unlocks after budget</span>
              </div>
            </>
          ) : null}

        </div>{/* end strip */}

        {/* ── Results ── */}
        <div className="mt-8">
          {hasIntent ? (
            <>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
                    {resultsHeading}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {matches.length > 0
                      ? `${matches.length} vehicle${matches.length === 1 ? "" : "s"} matched — showing your top picks.`
                      : "Based on the priorities you selected."}
                  </p>
                </div>
                {matches.length > 0 && (
                  <Link href={inventoryHref} className={`${btnSecondarySm} shrink-0`}>
                    {viewAllLabel} ({matches.length})
                  </Link>
                )}
              </div>

              {previewMatches.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--line-dark)] bg-white/60 py-10 text-center">
                  <p className="text-sm font-medium text-[var(--ink)]">{t("discovery.noMatches")}</p>
                  <Link href={inventoryHref} className={`${btnSecondarySm} mt-4 inline-flex`}>
                    Browse all inventory
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {previewMatches.map((vehicle) => {
                    const presentation = getVehicleMatchPresentationForShopper(
                      vehicle, intent, matchFilters, smartMatchCatalog, locale,
                    );
                    return (
                      <CompactMatchCard
                        key={vehicle.id}
                        vehicle={vehicle}
                        matchLabel={matchLabel}
                        chips={presentation.chips}
                        badgeLabel={presentation.badge ? getHighlightBadgeLabel(presentation.badge, locale) : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Pre-selection state — subtle, not empty-feeling */
            <div className="flex items-start gap-4 rounded-xl border border-dashed border-[var(--line-dark)] bg-white/40 px-6 py-5">
              <span className="mt-0.5 text-2xl" aria-hidden>🚗</span>
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">Your matches will appear here.</p>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                  Pick a category above — we'll instantly surface the best vehicles from our inventory that fit your needs.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

/* ── Shared sub-components ── */

function StepBubble({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  const filled = active || done;
  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-200 ${
      filled ? "bg-[var(--ink)] text-white" : "border border-[var(--line-dark)] bg-transparent text-[var(--muted)]"
    }`}>
      {done && !active ? <CheckIcon /> : n}
    </span>
  );
}

function CompactMatchCard({
  vehicle, matchLabel, chips, badgeLabel,
}: { vehicle: Vehicle; matchLabel?: string; chips?: string[]; badgeLabel?: string }) {
  const href      = vehicleDetailPath(vehicle.id);
  const title     = formatVehicleTitle(vehicle);
  const effective = getEffectiveVehiclePrice(vehicle);
  const price     = effective.amount === null ? NO_PRICE_LABEL : formatVehiclePrice(vehicle);
  const isCall    = effective.amount === null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-[var(--line-dark)]/80 bg-white shadow-[0_1px_6px_rgba(9,33,63,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-[0_10px_30px_-8px_rgba(9,33,63,0.16)]">
      <Link href={href} className="relative block aspect-[16/9] overflow-hidden bg-[var(--cream-dark)]">
        <VehicleImage vehicle={vehicle} placeholderSize="sm" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
        {(badgeLabel ?? matchLabel) && (
          <span className="absolute left-2.5 top-2.5 z-[1] rounded-full border border-white/20 bg-[var(--ink)]/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
            {badgeLabel ?? matchLabel}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <Link href={href} className="block transition-opacity hover:opacity-80">
          <h3 className="text-[13px] font-semibold leading-snug text-[var(--ink)]">{title}</h3>
          {vehicle.trim && <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">{vehicle.trim}</p>}
        </Link>
        {chips && chips.length > 0 && <MatchReasonChips chips={chips.slice(0, 2)} variant="subtle" />}
        <p className={`mt-auto text-sm font-semibold ${isCall ? "text-[var(--muted)]" : "text-[var(--ink)]"}`}>{price}</p>
        <Link href={href} className="mt-1 rounded-md border border-[var(--line-dark)] bg-[var(--cream)] py-1.5 text-center text-[12px] font-semibold text-[var(--ink)] transition-colors hover:border-[var(--ink)]/40 hover:bg-white">
          View Vehicle
        </Link>
      </div>
    </article>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden>
      <path d="M2 6l3 3 5-5" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="h-3 w-3 text-[var(--muted)]" aria-hidden>
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function TapArrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 gd-tap-arrow" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
