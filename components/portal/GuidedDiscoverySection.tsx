"use client";

import { useMemo } from "react";
import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import { filterVehicles } from "@/lib/filterVehicles";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import { MATCH_BADGE_LEGEND, getMatchLabel } from "@/lib/matchLabels";
import type { BudgetRange, ShopperIntent, Vehicle } from "@/lib/types";
import { VehicleCard } from "./VehicleCard";

const STEP1_OPTIONS: { id: ShopperIntent; label: string; desc: string }[] = [
  { id: "family-suv", label: "Family & daily life", desc: "SUVs, space, comfort" },
  { id: "work-truck", label: "Work & capability", desc: "Trucks, towing, utility" },
  { id: "luxury", label: "Luxury & design", desc: "Premium, refined" },
  { id: "under-30k", label: "Value & budget", desc: "Smart spend under $30k" },
  { id: "first-time", label: "First vehicle", desc: "Approachable, guided" },
  { id: "fuel-efficient", label: "Efficiency", desc: "Lower running costs" },
];

const STEP2_OPTIONS: { id: BudgetRange; label: string }[] = [
  { id: "any", label: "Flexible" },
  { id: "under-30k", label: "Under $30k/mo feel" },
  { id: "30-50k", label: "$30k – $50k" },
  { id: "50k-plus", label: "$50k+" },
];

interface GuidedDiscoverySectionProps {
  vehicles: Vehicle[];
}

export function GuidedDiscoverySection({ vehicles }: GuidedDiscoverySectionProps) {
  const { openLead } = useLeadCapture();
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

  const matches = useMemo(
    () => filterVehicles(vehicles, intent, budget, condition).slice(0, 8),
    [vehicles, intent, budget, condition],
  );

  const matchLabel = getMatchLabel(intent);
  const showResults = guidedStep === 3;

  return (
    <section
      id="guided-discovery"
      className="scroll-mt-20 relative overflow-hidden border-y border-[var(--line)] bg-white py-16 sm:py-24"
    >
      <div className="portal-container relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              Smart match
            </p>
            <h2 className="mt-3 headline-stack text-4xl sm:text-5xl">
              Refine your fit
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
                title="What do you need it for?"
                subtitle="Pick the story that fits your life—we'll bias inventory toward it."
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  {STEP1_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setIntent(opt.id);
                        setGuidedStep(2);
                      }}
                      className={`rounded-2xl border px-4 py-4 text-left transition duration-300 ${
                        intent === opt.id
                          ? "border-[var(--gold)] bg-[var(--cream)] ring-1 ring-[var(--gold)]"
                          : "border-[var(--line-dark)] bg-[var(--cream)] hover:border-[var(--ink)]/20"
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
                title="What payment range feels comfortable?"
                subtitle="No forms—just a range so we can respect your comfort zone."
              >
                <div className="flex flex-wrap gap-2">
                  {STEP2_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setBudget(opt.id);
                        setGuidedStep(3);
                      }}
                      className={`rounded-full px-5 py-3 text-sm font-medium transition ${
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
                title="New, pre-owned, or either?"
                subtitle="Last preference—then we reveal your matches."
              >
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["either", "Either"],
                      ["new", "New"],
                      ["used", "Pre-owned"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCondition(value)}
                      className={`rounded-full px-5 py-3 text-sm font-medium transition ${
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
            <div className="card-framer min-h-[320px] p-6 sm:p-8">
              {showResults ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
                        Your matches
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold">
                        {matches.length} vehicles surfaced
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                        Based on your selections, here are vehicles that may fit
                        your lifestyle.
                      </p>
                      <p className="mt-2 text-xs text-[var(--muted)]">
                        Tuned for {matchLabel} · live group inventory
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {MATCH_BADGE_LEGEND.map((badge) => (
                          <span
                            key={badge}
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
                              badge === matchLabel
                                ? "bg-[var(--ink)] text-white"
                                : "bg-[var(--cream)] text-[var(--muted)] ring-1 ring-[var(--line-dark)]"
                            }`}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const v = matches[0] ?? vehicles[0];
                        openLead({
                          action: "general-shortlist",
                          vehicle: v,
                          shopperIntent: `Smart match: ${intent}, ${budget}, ${condition}`,
                        });
                      }}
                      className="hidden shrink-0 rounded-full border border-[var(--line-dark)] px-5 py-2.5 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--ink)] sm:block"
                    >
                      Get My Shortlist
                    </button>
                  </div>

                  {matches.length === 0 ? (
                    <p className="mt-12 rounded-2xl border border-dashed border-[var(--line-dark)] bg-[var(--cream)] px-6 py-16 text-center text-[var(--muted)]">
                      No matches yet—try broadening payment range or condition.
                    </p>
                  ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2">
                      {matches.map((vehicle) => (
                        <VehicleCard
                          key={vehicle.id}
                          vehicle={vehicle}
                          matchLabel={getMatchLabel(intent)}
                          variant="editorial"
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[var(--gold)]/30 to-[var(--cream-dark)]" />
                  <p className="mt-6 text-lg font-medium text-[var(--ink)]">
                    Complete the steps to reveal your matches
                  </p>
                  <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
                    Step {guidedStep} of 3 — designed like a product selector,
                    not a dealership form.
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
  return (
    <div className="card-framer p-6 sm:p-7">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Step {step}
      </span>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
