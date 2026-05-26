"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { HomepageInventorySearchBridge } from "@/components/home/HomepageInventorySearchBridge";
import { usePortalText } from "@/components/providers/TextSettingsProvider";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import { localizeCommunityHero } from "@/lib/communityHeroI18n";
import { isGuidedDiscoveryHref } from "@/lib/communityHeroUtils";
import type { CommunityHeroContent, CommunityHeroImageSlot } from "@/lib/communityHeroTypes";
import {
  DEFAULT_INVENTORY_FILTERS,
  filtersToSearchParams,
} from "@/lib/inventorySearch";
import {
  filtersFromLifeCategory,
  getLocalizedLifeCategory,
  LIFE_CATEGORIES,
  type LifeCategoryId,
} from "@/lib/lifeFilters";

const SHOWCASE_CHIP_ORDER: LifeCategoryId[] = [
  "family",
  "everyday-drive",
  "work",
  "luxury",
  "budget",
  "fuel-efficient",
];

const TRUST_ITEMS = [
  { icon: "🚗", labelEn: "Large local inventory", labelEs: "Gran inventario local" },
  { icon: "🤝", labelEn: "Community impact", labelEs: "Impacto comunitario" },
  { icon: "✓", labelEn: "Certified service", labelEs: "Servicio certificado" },
  { icon: "💳", labelEn: "Flexible financing", labelEs: "Financiamiento flexible" },
  { icon: "⭐", labelEn: "Trusted Cavender family", labelEs: "Familia Cavender de confianza" },
  { icon: "📍", labelEn: "Multiple locations", labelEs: "Varias ubicaciones" },
] as const;

interface ShowcaseHeroProps {
  content: CommunityHeroContent;
}

function heroImage(
  images: CommunityHeroImageSlot[],
  position: CommunityHeroImageSlot["position"],
): CommunityHeroImageSlot | undefined {
  return images.find((s) => s.position === position);
}

function ShowcaseSlideCard({
  title,
  href,
  imageUrl,
  imageAlt,
  tone,
  onGuided,
}: {
  title: string;
  href: string;
  imageUrl?: string;
  imageAlt?: string;
  tone: "magenta" | "navy";
  onGuided?: () => void;
}) {
  const className = `showcase-hero__slide showcase-hero__slide--${tone} group`;

  const inner = (
    <>
      <span className="showcase-hero__slide-thumb">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={imageAlt ?? ""} className="h-full w-full object-cover" />
        ) : (
          <span className="showcase-hero__slide-thumb-placeholder" aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-tight">{title}</span>
        <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium opacity-90 group-hover:underline">
          Explore
          <span aria-hidden>→</span>
        </span>
      </span>
    </>
  );

  if (isGuidedDiscoveryHref(href) && onGuided) {
    return (
      <button type="button" onClick={onGuided} className={className}>
        {inner}
      </button>
    );
  }

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <a href={href} className={className} rel="noopener noreferrer">
      {inner}
    </a>
  );
}

function ShowcasePrimaryCta({
  label,
  url,
}: {
  label: string;
  url: string;
}) {
  const { scrollToGuided } = useDiscovery();

  if (isGuidedDiscoveryHref(url)) {
    return (
      <button type="button" onClick={scrollToGuided} className="showcase-hero__cta">
        {label}
      </button>
    );
  }

  if (url.startsWith("/")) {
    return (
      <Link href={url} className="showcase-hero__cta">
        {label}
      </Link>
    );
  }

  return (
    <a href={url} className="showcase-hero__cta" rel="noopener noreferrer">
      {label}
    </a>
  );
}

export function ShowcaseHero({ content: rawContent }: ShowcaseHeroProps) {
  const router = useRouter();
  const { scrollToGuided } = useDiscovery();
  const { locale } = useLanguage();
  const content = useMemo(
    () => localizeCommunityHero(rawContent, locale),
    [rawContent, locale],
  );

  const cmsTitleFallback =
    content.headlineLines.map((line) => line.text).join(" ") || "Cavender Confidence.";
  const cmsSubtitleFallback =
    content.subheadline.trim() ||
    content.body.trim() ||
    "Every vehicle supports the people and causes that make our communities stronger.";

  const portalTitle = usePortalText("homepage.title", cmsTitleFallback);
  const portalSubtitle = usePortalText("homepage.subtitle", cmsSubtitleFallback);

  const primaryButton = content.buttons[0];
  const slideOne =
    content.buttons[1] ??
    content.buttons.find((b) => b.variant === "secondary") ?? {
      label: "Browse inventory",
      url: "/inventory",
      variant: "secondary" as const,
    };
  const slideTwo =
    content.buttons.find((b) => isGuidedDiscoveryHref(b.url)) ??
    primaryButton ?? {
      label: "Start your journey",
      url: "#guided-discovery",
      variant: "primary" as const,
    };

  const featured = heroImage(content.images, "center_small") ?? heroImage(content.images, "top_left");
  const slideImgA = heroImage(content.images, "right_tall");
  const slideImgB = heroImage(content.images, "bottom_wide");

  const chipCategories = useMemo(() => {
    const byId = new Map(LIFE_CATEGORIES.map((c) => [c.id, c]));
    return SHOWCASE_CHIP_ORDER.map((id) => byId.get(id)).filter(
      (c): c is (typeof LIFE_CATEGORIES)[number] => c != null,
    );
  }, []);

  function navigateToCategory(categoryId: LifeCategoryId) {
    const patch = filtersFromLifeCategory(categoryId);
    const params = filtersToSearchParams({
      ...DEFAULT_INVENTORY_FILTERS,
      ...patch,
    });
    router.push(`/inventory?${params.toString()}`);
  }

  return (
    <section className="showcase-hero" aria-labelledby="showcase-hero-heading">
      <div className="portal-container">
        <div className="showcase-hero__stage">
          <div className="showcase-hero__stage-grid">
            <div className="showcase-hero__copy">
              <h1
                id="showcase-hero-heading"
                className="showcase-hero__headline text-balance"
              >
                {portalTitle}
              </h1>
              {portalSubtitle ? (
                <p className="showcase-hero__subhead">{portalSubtitle}</p>
              ) : null}
              {primaryButton ? (
                <div className="mt-8">
                  <ShowcasePrimaryCta label={primaryButton.label} url={primaryButton.url} />
                </div>
              ) : null}
            </div>

            <div className="showcase-hero__featured" aria-hidden={!featured?.url}>
              {featured?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.url}
                  alt={featured.alt ?? ""}
                  className="showcase-hero__featured-img"
                />
              ) : (
                <div className="showcase-hero__featured-placeholder" />
              )}
            </div>

            <div className="showcase-hero__slides">
              <ShowcaseSlideCard
                title={slideOne.label}
                href={slideOne.url}
                imageUrl={slideImgA?.url}
                imageAlt={slideImgA?.alt}
                tone="magenta"
                onGuided={scrollToGuided}
              />
              <ShowcaseSlideCard
                title={slideTwo.label}
                href={slideTwo.url}
                imageUrl={slideImgB?.url}
                imageAlt={slideImgB?.alt}
                tone="navy"
                onGuided={scrollToGuided}
              />
            </div>
          </div>
        </div>

        <div className="showcase-hero__search mt-8 sm:mt-10">
          <HomepageInventorySearchBridge variant="hero" hideEyebrow hideHelperLine />
        </div>

        <ul className="showcase-hero__trust" aria-label="Why shop with us">
          {TRUST_ITEMS.map((item) => (
            <li key={item.labelEn} className="showcase-hero__trust-item">
              <span className="showcase-hero__trust-icon" aria-hidden>
                {item.icon}
              </span>
              <span>{locale === "es" ? item.labelEs : item.labelEn}</span>
            </li>
          ))}
        </ul>

        <div
          className="showcase-hero__chips-scroll mt-6 sm:mt-8"
          role="list"
          aria-label="Shop by lifestyle"
        >
          {chipCategories.map((cat) => {
            const localized = getLocalizedLifeCategory(cat, locale);
            return (
              <button
                key={cat.id}
                type="button"
                role="listitem"
                onClick={() => navigateToCategory(cat.id)}
                className="showcase-hero__chip group"
              >
                <span className="showcase-hero__chip-media">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="showcase-hero__chip-fallback" aria-hidden />
                  )}
                  <span className="showcase-hero__chip-scrim" aria-hidden />
                </span>
                <span className="showcase-hero__chip-label">{localized.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
