"use client";

import { useMemo } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { TopPickCard } from "@/components/home/TopPickCard";
import {
  buildTopPickCards,
  resolveTopPicksIntro,
} from "@/lib/topPicks";
import type { TopPicksCmsPayload } from "@/lib/topPicksTypes";
import type { Vehicle } from "@/lib/types";

interface TopPicksSectionProps {
  vehicles: Vehicle[];
  cms: TopPicksCmsPayload;
}

export function TopPicksSection({ vehicles, cms }: TopPicksSectionProps) {
  const { locale, t } = useLanguage();

  const intro = useMemo(
    () => resolveTopPicksIntro(cms.pageSection, locale, t),
    [cms.pageSection, locale, t],
  );

  const picks = useMemo(
    () => buildTopPickCards(vehicles, cms.pageSection, locale, t),
    [vehicles, cms.pageSection, locale, t],
  );

  if (picks.length === 0) return null;

  return (
    <section
      id="top-picks"
      className="scroll-mt-20 border-y border-[var(--line)] bg-[var(--cream)] py-16 sm:py-24"
    >
      <div className="portal-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            {t("topPicks.eyebrow")}
          </p>
          <h2 className="mt-4 headline-stack text-4xl sm:text-5xl">
            {intro.headline}
          </h2>
          <p className="mt-4 text-[var(--muted)]">{intro.subheadline}</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((pick) => (
            <TopPickCard key={pick.slot} pick={pick} />
          ))}
        </div>
      </div>
    </section>
  );
}
