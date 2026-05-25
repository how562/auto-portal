"use client";

import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import type { LeadAction } from "@/lib/leads";
import { btnPrimaryLg } from "@/lib/buttonClasses";
import { cardFormWrap } from "@/lib/cardClasses";
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
  const headline =
    section.headline ?? settingString(settings, "headline", "Let us help");
  const subheadline =
    section.subheadline ??
    settingString(
      settings,
      "subheadline",
      "Share a few details and we will curate options across our stores.",
    );
  const ctaLabel = settingString(settings, "cta_label", "Get started");
  const leadAction = parseLeadAction(settingString(settings, "lead_action", "general-shortlist"));
  const shopperIntent =
    settingString(settings, "shopper_intent") ||
    `CMS form: ${headline}`;

  return (
    <section className="py-14 sm:py-20">
      <div className="portal-container">
        <div className={cardFormWrap}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Connect
          </p>
          <h2 className="mt-4 headline-stack text-3xl sm:text-4xl">{headline}</h2>
          {subheadline ? (
            <p className="mt-3 text-[var(--muted)] leading-snug">{subheadline}</p>
          ) : null}
          <button
            type="button"
            onClick={() =>
              openLead({
                action: leadAction,
                shopperIntent,
              })
            }
            className={`mt-8 ${btnPrimaryLg}`}
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
