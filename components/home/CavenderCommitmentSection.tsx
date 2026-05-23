"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCta } from "@/components/cta/CtaProvider";
import { CommitmentStarPattern } from "@/components/home/CommitmentStarPattern";
import { CommitmentValueIcon } from "@/components/home/CommitmentValueIcon";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { resolveCavenderCommitmentContent } from "@/lib/cavenderCommitmentContent";
import type { CavenderCommitmentCmsPayload } from "@/lib/cavenderCommitmentTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface CavenderCommitmentSectionProps {
  cms: CavenderCommitmentCmsPayload;
}

function CommitmentImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-[inherit] w-full flex-col items-center justify-center gap-3 bg-[var(--cream-dark)] px-6">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-md bg-white shadow-tight"
        aria-hidden
      >
        <svg
          className="h-5 w-5 text-[var(--muted)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
          <path
            d="M3 16l5-5 4 4 3-3 6 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
    </div>
  );
}

function CommitmentImageCard({
  imageUrl,
  imageAlt,
  className = "",
}: {
  imageUrl: string | null;
  imageAlt: string;
  className?: string;
}) {
  return (
    <div
      className={`hero-collage-tile min-h-[12.65rem] sm:min-h-[14.95rem] lg:min-h-[19.55rem] lg:max-h-[23rem] ${className}`.trim()}
    >
      <div className="relative h-full w-full min-h-[inherit]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover"
          />
        ) : (
          <CommitmentImagePlaceholder label={imageAlt} />
        )}
      </div>
    </div>
  );
}

export function CavenderCommitmentSection({
  cms,
}: CavenderCommitmentSectionProps) {
  const { locale, t } = useLanguage();
  const learnMoreCta = useCta("commitment_learn_more");
  const browseVehiclesCta = useCta("commitment_browse_vehicles");

  const content = useMemo(
    () => resolveCavenderCommitmentContent(cms.pageSection, locale, t),
    [cms.pageSection, locale, t],
  );

  const headlineLines = content.headline.split(/\n+/).filter(Boolean);
  const primaryHref = content.primaryCtaHref ?? learnMoreCta.url ?? "#";
  const secondaryHref =
    content.secondaryCtaHref ?? browseVehiclesCta.url ?? "#";
  const primaryBtn = `${btnPrimaryMd} inline-flex w-full min-h-[3rem] shrink-0 px-6 sm:w-auto`;
  const secondaryBtn = `${btnSecondaryMd} inline-flex w-full min-h-[3rem] shrink-0 px-6 sm:w-auto`;

  return (
    <section
      id="cavender-commitment"
      className="relative scroll-mt-20 overflow-x-hidden bg-[var(--cream)] py-12 sm:py-16 lg:py-20"
    >
      <CommitmentStarPattern />

      <div className="portal-container relative">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.15fr)_minmax(0,0.88fr)] lg:items-center lg:gap-8 xl:gap-10">
          <div className="relative z-10 order-1 flex min-w-0 flex-col items-center text-center sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:px-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
              {t("cavender_commitment_label")}
            </p>

            <h2 className="mt-5 w-full max-w-lg break-words font-serif font-semibold leading-[1.05] tracking-[-0.035em] hyphens-auto lg:max-w-[28rem]">
              {headlineLines.map((line, index) => (
                <span
                  key={index}
                  className={`block text-[clamp(1.65rem,4.5vw,2.75rem)] ${
                    index === headlineLines.length - 1 &&
                    headlineLines.length > 1
                      ? "text-[#9a9288]"
                      : "text-[var(--ink)]"
                  }`}
                >
                  {line}
                </span>
              ))}
            </h2>

            <p className="mt-5 max-w-lg break-words text-base leading-relaxed text-[var(--muted)] sm:text-[1.0625rem] sm:leading-[1.58] lg:max-w-[28rem]">
              {content.body}
            </p>

            <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4">
              <Link href={primaryHref} className={primaryBtn}>
                {learnMoreCta.label}
              </Link>
              <Link href={secondaryHref} className={secondaryBtn}>
                {browseVehiclesCta.label}
              </Link>
            </div>
          </div>

          <CommitmentImageCard
            imageUrl={content.rightImageUrl}
            imageAlt={content.rightImageAlt}
            className="order-2 lg:col-start-3 lg:row-start-1"
          />

          <CommitmentImageCard
            imageUrl={content.leftImageUrl}
            imageAlt={content.leftImageAlt}
            className="order-3 hidden sm:block lg:col-start-1 lg:row-start-1"
          />
        </div>

        <ul className="relative z-10 mt-8 hidden gap-5 border-t border-[var(--line)]/80 pt-8 sm:grid sm:grid-cols-2 lg:mt-10 lg:grid-cols-4 lg:gap-6">
          {content.values.map((item) => (
            <li key={item.id} className="flex min-w-0 gap-2.5">
              <CommitmentValueIcon id={item.id} />
              <div className="min-w-0">
                <h3 className="break-words text-sm font-semibold leading-tight text-[var(--ink)]">
                  {item.title}
                </h3>
                <p className="mt-0.5 break-words text-xs leading-snug text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
