"use client";

import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import type { LeadAction } from "@/lib/leads";
import { settingString, parseSettings } from "@/lib/cmsSettings";
import type { PageSection } from "@/lib/cmsTypes";

const LEAD_ACTIONS: LeadAction[] = [
  "general-shortlist",
  "shortlist",
  "availability",
  "compare",
];

function parseLeadAction(value: string): LeadAction {
  if (LEAD_ACTIONS.includes(value as LeadAction)) {
    return value as LeadAction;
  }
  return "general-shortlist";
}

export function CMSFormSection({ section }: { section: PageSection }) {
  const { openLead } = useLeadCapture();
  const settings = parseSettings(section.settings);
  const headline = section.title ?? settingString(settings, "headline", "Let us help");
  const subheadline =
    section.subtitle ??
    settingString(settings, "subheadline", "Share a few details and we will curate options across our stores.");
  const ctaLabel = settingString(settings, "cta_label", "Get started");
  const leadAction = parseLeadAction(settingString(settings, "lead_action", "general-shortlist"));
  const shopperIntent =
    settingString(settings, "shopper_intent") ||
    `CMS form: ${headline}`;

  return (
    <section className="py-14 sm:py-20">
      <div className="portal-container">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-[var(--line)] bg-white px-8 py-12 text-center shadow-[0_12px_48px_rgba(12,12,12,0.06)] sm:px-12 sm:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Connect
          </p>
          <h2 className="mt-4 headline-stack text-3xl sm:text-4xl">{headline}</h2>
          {subheadline ? (
            <p className="mt-4 text-[var(--muted)] leading-relaxed">{subheadline}</p>
          ) : null}
          <button
            type="button"
            onClick={() =>
              openLead({
                action: leadAction,
                shopperIntent,
              })
            }
            className="mt-8 rounded-full bg-[var(--ink)] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--charcoal)] hover:shadow-[0_12px_40px_rgba(12,12,12,0.12)]"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
