"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useCta } from "@/components/cta/CtaProvider";
import { CommitmentStarPattern } from "@/components/home/CommitmentStarPattern";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { resolveCavenderCommitmentContent } from "@/lib/cavenderCommitmentContent";
import type { CavenderCommitmentCmsPayload } from "@/lib/cavenderCommitmentTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

const COMMITMENT_LOGO = "/brand/cavender-commitment.png";
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
      className={`homepage-commitment-image hero-collage-tile min-h-[12.65rem] sm:min-h-[14.95rem] ${className}`.trim()}
    >
      <div className="relative h-full w-full min-h-[inherit]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-full w-full object-cover object-center"
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

  /** Homepage copy — always from i18n (CMS often has stale headline/body). */
  const headline = t("commitment.headline").replace(/\s*\n+\s*/g, " ").trim();
  const body = t("commitment.body");
  const primaryHref =
    content.primaryCtaHref ?? learnMoreCta.url ?? "/cavender-commitment";
  const secondaryHref =
    content.secondaryCtaHref ?? browseVehiclesCta.url ?? "/inventory";
  const primaryBtn = `${btnPrimaryMd} inline-flex w-full min-h-[3rem] shrink-0 px-6 sm:w-auto`;
  const secondaryBtn = `${btnSecondaryMd} inline-flex w-full min-h-[3rem] shrink-0 px-6 sm:w-auto`;

  return (
    <section
      id="cavender-commitment"
      className="homepage-commitment relative scroll-mt-20 overflow-x-hidden"
    >
      <CommitmentStarPattern />

      <div className="portal-container relative">
        <div className="homepage-commitment-grid grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.15fr)_minmax(0,0.88fr)] lg:items-stretch lg:gap-8 xl:gap-10">
          <div className="relative z-10 order-1 flex min-w-0 flex-col items-center text-center sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:px-3">
            <div className="homepage-commitment-logo-wrap flex w-full justify-center">
              <Image
                src={COMMITMENT_LOGO}
                alt="Cavender Commitment"
                width={1177}
                height={217}
                className="homepage-commitment-logo"
                priority={false}
              />
            </div>

            <h2 className="homepage-commitment-headline mt-5 w-full max-w-lg break-words font-sans text-[clamp(1.65rem,4.5vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--ink)] hyphens-auto lg:max-w-[28rem]">
              {headline}
            </h2>
            <p className="mt-5 max-w-lg break-words text-base leading-relaxed text-[var(--muted)] sm:text-[1.0625rem] sm:leading-[1.58] lg:max-w-[28rem]">
              {body}
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
      </div>
    </section>
  );
}
