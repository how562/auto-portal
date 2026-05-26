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
      className="homepage-how-it-works relative scroll-mt-20 overflow-hidden py-12 sm:py-16"
    >
      <div className="homepage-process-connector" aria-hidden />

      <div className="portal-container relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
          {t("howItWorks.eyebrow")}
        </p>
        <h2 className="mt-3 headline-stack max-w-2xl text-3xl text-[var(--ink)] sm:text-4xl">
          {t("howItWorks.title")}
        </h2>

        <div className="relative mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {steps.map((step) => (
            <article
              key={step.num}
              className="homepage-process-step rounded-md p-5 sm:p-6"
            >
              <span className="homepage-process-num">{step.num}</span>
              <h3 className="mt-4 text-lg font-semibold text-[var(--ink)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {step.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <DiscoveryCTA />
        </div>
      </div>
    </section>
  );
}
