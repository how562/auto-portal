"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { HomepageInventorySearchBridge } from "@/components/home/HomepageInventorySearchBridge";
import { usePortalText } from "@/components/providers/TextSettingsProvider";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import { localizeCommunityHero } from "@/lib/communityHeroI18n";
import { isGuidedDiscoveryHref } from "@/lib/communityHeroUtils";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import type { CommunityHeroImagePosition } from "@/lib/communityHeroTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

const TILE_CLASS: Record<CommunityHeroImagePosition, string> = {
  top_left: "hero-collage-tile-a min-h-[11rem] sm:min-h-[12.5rem]",
  right_tall: "hero-collage-tile-b",
  center_small: "hero-collage-tile-c min-h-[9rem] sm:min-h-[10rem]",
  bottom_wide: "hero-collage-tile-d min-h-[8rem] sm:min-h-[9rem]",
};

interface EditorialHeroProps {
  content: CommunityHeroContent;
}

function HeroImagePlaceholder() {
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
          <path d="M3 16l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Image placeholder
      </p>
    </div>
  );
}

function HeroCollageTile({
  imageUrl,
  alt = "",
  className = "",
}: {
  imageUrl?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <div className={`hero-collage-tile ${className}`.trim()}>
      <div className="relative h-full w-full min-h-[inherit]">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <HeroImagePlaceholder />
        )}
      </div>
    </div>
  );
}

function HeroCollage({ content }: { content: CommunityHeroContent }) {
  return (
    <div className="relative w-full lg:pl-1">
      <div className="hero-collage-grid">
        {content.images.map((slot) => (
          <HeroCollageTile
            key={slot.position}
            imageUrl={slot.url}
            alt={slot.alt ?? ""}
            className={TILE_CLASS[slot.position]}
          />
        ))}
      </div>
    </div>
  );
}

function HeroButtons({ content }: { content: CommunityHeroContent }) {
  const { scrollToGuided } = useDiscovery();

  const primaryClass = `${btnPrimaryMd} min-h-[3rem] min-w-[10.5rem]`;
  const secondaryClass = `${btnSecondaryMd} min-h-[3rem] min-w-[10.5rem]`;

  return (
    <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      {content.buttons.map((button) => {
        const className =
          button.variant === "primary" ? primaryClass : secondaryClass;

        if (isGuidedDiscoveryHref(button.url)) {
          return (
            <button
              key={`${button.label}-${button.url}`}
              type="button"
              onClick={scrollToGuided}
              className={className}
            >
              {button.label}
            </button>
          );
        }

        if (button.url.startsWith("/")) {
          return (
            <Link key={`${button.label}-${button.url}`} href={button.url} className={className}>
              {button.label}
            </Link>
          );
        }

        return (
          <a
            key={`${button.label}-${button.url}`}
            href={button.url}
            className={className}
            rel="noopener noreferrer"
          >
            {button.label}
          </a>
        );
      })}
    </div>
  );
}

function splitTitleLines(title: string): { text: string; muted: boolean }[] {
  const parts = title
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (parts.length === 0) return [];
  return parts.map((text, index) => ({
    text,
    muted: parts.length > 1 && index === parts.length - 1,
  }));
}

export function EditorialHero({ content: rawContent }: EditorialHeroProps) {
  const { t, locale } = useLanguage();
  const content = useMemo(
    () => localizeCommunityHero(rawContent, locale),
    [rawContent, locale],
  );

  const cmsTitleFallback =
    content.headlineLines.map((line) => line.text).join("\n") ||
    `${t("hero.headline1")}\n${t("hero.headline2")}`;
  const cmsSubtitleFallback =
    content.subheadline.trim() ||
    content.body.trim() ||
    t("hero.body");

  const portalTitle = usePortalText("homepage.title", cmsTitleFallback);
  const portalSubtitle = usePortalText("homepage.subtitle", cmsSubtitleFallback);
  const titleLines = splitTitleLines(portalTitle);

  return (
    <section className="homepage-hero relative overflow-hidden">
      <div className="homepage-hero-tread-left" aria-hidden />
      <div className="homepage-hero-tread-right" aria-hidden />
      <div className="homepage-hero-blueprint" aria-hidden />
      <div className="portal-container relative z-[1]">
        <div className="homepage-hero__content grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-20 xl:gap-24">
          <div className="order-1 flex max-w-xl flex-col lg:max-w-none">
            {titleLines.length > 0 ? (
              <h1 className="headline-stack text-balance font-sans">
                {titleLines.map((line) => (
                  <span
                    key={line.text}
                    className={`block text-[clamp(2.75rem,7vw,5.25rem)] ${
                      line.muted ? "text-[#9a9288]" : "text-[var(--ink)]"
                    }`}
                  >
                    {line.text}
                  </span>
                ))}
              </h1>
            ) : null}

            {portalSubtitle ? (
              <p className="mt-10 max-w-[34rem] text-base leading-relaxed text-[var(--muted)] sm:text-[1.0625rem] sm:leading-[1.62]">
                {portalSubtitle}
              </p>
            ) : null}

            <HeroButtons content={content} />
          </div>

          <div className="order-2 lg:flex lg:items-start lg:justify-end">
            <HeroCollage content={content} />
          </div>
        </div>

        <div className="mt-8 sm:mt-10 lg:mt-11">
          <HomepageInventorySearchBridge variant="hero" hideEyebrow hideHelperLine />
        </div>
      </div>
    </section>
  );
}
