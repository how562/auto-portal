"use client";

import { useCta } from "@/components/cta/CtaProvider";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { btnPrimaryLg } from "@/lib/buttonClasses";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";

export function InventoryConfidenceBand() {
  const { t } = useLanguage();
  const { openLead } = useLeadCapture();
  const shortlistCta = useCta("get_my_shortlist");

  return (
    <div className="rounded-lg border border-[var(--line-dark)] bg-white px-6 py-8 sm:px-10 sm:py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
        {t("inventory.confidence.eyebrow")}
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
        {t("inventory.confidence.title")}
      </h3>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
        {t("inventory.confidence.body")}
      </p>
      <button
        type="button"
        onClick={() =>
          openLead({
            action: "general-shortlist",
            shopperIntent: "SRP: Let us build your shortlist",
          })
        }
        className={`mt-6 ${btnPrimaryLg}`}
      >
        {shortlistCta.label}
      </button>
    </div>
  );
}
