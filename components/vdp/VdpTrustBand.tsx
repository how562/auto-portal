"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";

const TRUST_KEYS = [
  { titleKey: "vdp.trust.inspected" as const, bodyKey: "vdp.trust.inspectedBody" as const },
  { titleKey: "vdp.trust.fees" as const, bodyKey: "vdp.trust.feesBody" as const },
  { titleKey: "vdp.trust.confidence" as const, bodyKey: "vdp.trust.confidenceBody" as const },
] as const;

export function VdpTrustBand() {
  const { t } = useLanguage();

  const defaults: Record<string, string> = {
    "vdp.trust.inspected": "Vehicle inspected",
    "vdp.trust.inspectedBody": "Every listing is reviewed before it reaches you.",
    "vdp.trust.fees": "No hidden fees",
    "vdp.trust.feesBody": "Straightforward pricing guidance from our team.",
    "vdp.trust.confidence": "Backed by Cavender Confidence",
    "vdp.trust.confidenceBody": "A group-wide standard for how we serve drivers.",
  };

  return (
    <section
      aria-label="Purchase confidence"
      className="grid gap-4 sm:grid-cols-3"
    >
      {TRUST_KEYS.map((item) => (
        <div
          key={item.titleKey}
          className="rounded-lg border border-[var(--line-dark)]/80 bg-white px-5 py-5 shadow-[var(--shadow-tight)]"
        >
          <p className="text-sm font-semibold tracking-tight text-[var(--ink)]">
            {t(item.titleKey, defaults[item.titleKey])}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
            {t(item.bodyKey, defaults[item.bodyKey])}
          </p>
        </div>
      ))}
    </section>
  );
}
