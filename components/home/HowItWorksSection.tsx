"use client";

import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    {
      num: "01",
      title: t("howItWorks.step1Title"),
      body: t("howItWorks.step1Body"),
    },
    {
      num: "02",
      title: t("howItWorks.step2Title"),
      body: t("howItWorks.step2Body"),
    },
    {
      num: "03",
      title: t("howItWorks.step3Title"),
      body: t("howItWorks.step3Body"),
    },
  ];

  return (
    <section
      id="how-it-works"
      className="section-charcoal relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
    >
      <p className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none marquee-text">
        {t("howItWorks.marquee")}
      </p>

      <div className="portal-container relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-soft)]">
          {t("howItWorks.eyebrow")}
        </p>
        <h2 className="mt-4 headline-stack max-w-2xl text-4xl text-white sm:text-5xl">
          {t("howItWorks.title")}
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.num}
              className="rounded-md border border-white/10 bg-white/[0.04] p-6 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.07] sm:p-7"
            >
              <span className="text-5xl font-semibold tracking-tighter text-[var(--gold)]">
                {step.num}
              </span>
              <h3 className="mt-6 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                {step.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <DiscoveryCTA />
        </div>
      </div>
    </section>
  );
}
