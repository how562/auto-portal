"use client";

import { DiscoveryCTA } from "@/components/home/DiscoveryCTA";

const STEPS = [
  {
    num: "01",
    title: "Tell us how you drive",
    body: "Pick a lifestyle path or refine with our smart match concierge—purpose, budget, and condition in minutes.",
  },
  {
    num: "02",
    title: "We surface the right matches",
    body: "Live inventory across every store, filtered into editorial rails and match labels you can actually understand.",
  },
  {
    num: "03",
    title: "Choose your store and connect",
    body: "Check availability, compare similar, or request a shortlist—human follow-up without dealership friction.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="section-charcoal relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
    >
      <p className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none marquee-text">
        Choose · Match · Connect · Choose · Match · Connect ·
      </p>

      <div className="portal-container relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold-soft)]">
          How it works
        </p>
        <h2 className="mt-4 headline-stack max-w-2xl text-4xl text-white sm:text-5xl">
          Guided discovery, end to end
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <article
              key={step.num}
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-8 transition duration-500 hover:border-white/20 hover:bg-white/[0.07] hover-lift"
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
