"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { CMSFormSection } from "@/components/cms/CMSFormSection";
import {
  SectionBodyText,
  StandardSectionCopy,
} from "@/components/cms/StandardSectionCopy";
import { VehicleCard } from "@/components/portal/VehicleCard";
import {
  getSectionCopy,
  localizeCMSSections,
  resolveImageTextMediaSide,
  type SectionCopy,
} from "@/lib/cmsSectionDisplay";
import type { EnrichedCMSSection } from "@/lib/cmsSectionModel";
import {
  getRegistryEntry,
  registryHasDedicatedRenderer,
} from "@/lib/cmsSectionRegistry";
import { resolveSectionDesign } from "@/lib/cmsSectionDesign";
import { PresetPageSectionRenderer } from "@/components/cms/PresetPageSectionRenderer";
import { parseSettings, settingItems, settingString } from "@/lib/cmsSettings";
import { getPresetKeyFromSettings } from "@/lib/presetSectionStarters";
import { isSavedSectionPreset } from "@/lib/savedSectionPresets";
import { isProbablySafeHtml, sanitizeCmsHtml } from "@/lib/sanitizeHtml";
import type { Store } from "@/lib/types";
import { btnLightMd, btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";
import {
  cardCreamPad,
  cardEmpty,
  cardEmptyState,
  cardFaqItem,
  cardGridArticle,
  cardGridBody,
  cardHeroDark,
  cardHeroLight,
  cardImageFrame,
  cardLocation,
} from "@/lib/cardClasses";

function SectionShell({
  section,
  children,
  className = "",
  dark = false,
}: {
  section: EnrichedCMSSection;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  const design = resolveSectionDesign(section);
  const effectiveDark = dark || design.isDarkBg;

  return (
    <section
      className={`relative ${design.className} ${
        effectiveDark && !design.style.backgroundColor
          ? "bg-[var(--charcoal)] text-white"
          : ""
      } ${effectiveDark ? "text-white" : ""} ${className}`.trim()}
      style={Object.keys(design.style).length > 0 ? design.style : undefined}
    >
      {design.hasBgImage ? (
        <div
          className="pointer-events-none absolute inset-0 bg-black/20"
          aria-hidden
        />
      ) : null}
      <div className="relative">{children}</div>
    </section>
  );
}

function CmsLink({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "light";
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const className =
    variant === "primary"
      ? btnPrimaryMd
      : variant === "light"
        ? btnLightMd
        : btnSecondaryMd;

  const trimmed = href.trim();

  if (trimmed.startsWith("#")) {
    const targetId = trimmed.slice(1);
    if (isHome) {
      return (
        <button
          type="button"
          onClick={() =>
            document.getElementById(targetId)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            })
          }
          className={className}
        >
          {label}
        </button>
      );
    }
    return (
      <Link href={`/${trimmed}`} className={className}>
        {label}
      </Link>
    );
  }

  if (trimmed.startsWith("/")) {
    return (
      <Link href={trimmed} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={trimmed} className={className} rel="noopener noreferrer">
      {label}
    </a>
  );
}

function HeroSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const s = parseSettings(section.settings);
  const imageUrl = copy.imageUrl;
  const ctaLabel = settingString(s, "cta_label") || copy.ctaText;
  const ctaHref = copy.ctaUrl || settingString(s, "cta_href", "/inventory");
  const dark = settingString(s, "variant") === "dark";
  const subheadline = copy.subheadline || copy.body;

  return (
    <SectionShell section={section} dark={dark}>
      <div className="portal-container">
        <div className={dark ? cardHeroDark : cardHeroLight}>
          {imageUrl ? (
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-hidden
            />
          ) : null}
          <div className="relative max-w-3xl">
            {copy.eyebrow ? (
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${
                  dark ? "text-[var(--gold-soft)]" : "text-[var(--gold)]"
                }`}
              >
                {copy.eyebrow}
              </p>
            ) : null}
            {copy.headline ? (
              <h1 className="mt-4 headline-stack text-4xl sm:text-5xl lg:text-6xl">
                {copy.headline}
              </h1>
            ) : null}
            {subheadline && subheadline !== copy.body ? (
              <p
                className={`mt-6 max-w-xl text-lg leading-relaxed ${
                  dark ? "text-white/70" : "text-[var(--muted)]"
                }`}
              >
                {subheadline}
              </p>
            ) : copy.body && !copy.subheadline ? (
              <div
                className={`mt-6 max-w-xl text-lg leading-relaxed ${
                  dark ? "text-white/70" : "text-[var(--muted)]"
                }`}
              >
                <SectionBodyText body={copy.body} className="mt-0" />
              </div>
            ) : null}
            {ctaLabel ? (
              <div className="mt-10">
                <CmsLink
                  href={ctaHref}
                  label={ctaLabel}
                  variant={dark ? "light" : "primary"}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function TextBlockSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const s = parseSettings(section.settings);
  const align = settingString(s, "alignment", "left") === "center" ? "center" : "left";

  return (
    <SectionShell section={section}>
      <div className="portal-container">
        <div
          className={`mx-auto max-w-3xl ${align === "center" ? "text-center" : ""}`}
        >
          <StandardSectionCopy copy={copy} align={align} />
        </div>
      </div>
    </SectionShell>
  );
}

function ImageTextSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const s = parseSettings(section.settings);
  const mediaSide = resolveImageTextMediaSide(section);
  const mediaFirst = mediaSide === "left";
  const imageUrl = copy.imageUrl;
  const mediaType = settingString(s, "media_type", "image");
  const videoTitle = settingString(s, "video_title");

  const textBlock = (
    <div className="min-w-0">
      <StandardSectionCopy
        copy={copy}
        subheadlineClassName="mt-3 text-sm font-medium text-[var(--gold)]"
      />
    </div>
  );

  const mediaBlock = (
    <div className={`${cardImageFrame} min-h-[12rem] aspect-[4/3] lg:min-h-0`}>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-2 px-6 text-center text-sm text-[var(--muted)]">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {mediaType === "video" ? "Video" : "Image"}
          </span>
          {videoTitle ? <span>{videoTitle}</span> : null}
        </div>
      )}
    </div>
  );

  return (
    <SectionShell section={section}>
      <div className="portal-container">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          {mediaFirst ? (
            <>
              {mediaBlock}
              {textBlock}
            </>
          ) : (
            <>
              {textBlock}
              {mediaBlock}
            </>
          )}
        </div>
      </div>
    </SectionShell>
  );
}

function SplitFeatureSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const s = parseSettings(section.settings);
  const imageUrl = copy.imageUrl || settingString(s, "image_url");
  const sectionTitle = copy.headline;
  const items = settingItems<{ title?: string; body?: string }>(s, "items");
  const leftTitle = settingString(s, "left_title") || items[0]?.title;
  const leftBody = settingString(s, "left_body") || items[0]?.body;
  const rightTitle = settingString(s, "right_title") || items[1]?.title;
  const rightBody = settingString(s, "right_body") || items[1]?.body;

  return (
    <SectionShell section={section} className="bg-white">
      <div className="portal-container">
        {sectionTitle ? (
          <h2 className="mb-10 text-center headline-stack text-3xl sm:text-4xl">
            {sectionTitle}
          </h2>
        ) : null}
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            {(leftTitle || leftBody) && (
              <div className={cardCreamPad}>
                {leftTitle ? (
                  <h3 className="text-xl font-semibold tracking-tight">{leftTitle}</h3>
                ) : null}
                {leftBody ? (
                  <p className="mt-2 text-sm leading-snug text-[var(--muted)]">
                    {leftBody}
                  </p>
                ) : null}
              </div>
            )}
            {(rightTitle || rightBody) && (
              <div className={cardCreamPad}>
                {rightTitle ? (
                  <h3 className="text-xl font-semibold tracking-tight">{rightTitle}</h3>
                ) : null}
                {rightBody ? (
                  <p className="mt-2 text-sm leading-snug text-[var(--muted)]">
                    {rightBody}
                  </p>
                ) : null}
              </div>
            )}
          </div>
          <div className={`${cardImageFrame} aspect-[5/4]`}>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-2 px-6 text-center text-sm text-[var(--muted)]">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Image
                </span>
                <span>Add image_url to show photography</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function CtaBandSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const s = parseSettings(section.settings);
  const headline = copy.headline;
  const subheadline = copy.subheadline;
  const buttons = settingItems<{ label?: string; url?: string }>(s, "buttons");
  const ctaLabel = settingString(s, "cta_label", "Get started");
  const ctaHref = settingString(s, "cta_href", "/inventory");
  const dark = settingString(s, "variant") !== "light";

  return (
    <SectionShell section={section} dark={dark}>
      <div className="portal-container text-center">
        {headline ? (
          <h2 className="headline-stack text-3xl sm:text-4xl">{headline}</h2>
        ) : null}
        {subheadline ? (
          <p
            className={`mx-auto mt-4 max-w-xl ${dark ? "text-white/65" : "text-[var(--muted)]"}`}
          >
            {subheadline}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {buttons.length > 0 ? (
            buttons.map((btn, i) =>
              btn.label && btn.url ? (
                <CmsLink
                  key={`${btn.url}-${i}`}
                  href={btn.url}
                  label={btn.label}
                  variant={dark ? "light" : i === 0 ? "primary" : "secondary"}
                />
              ) : null,
            )
          ) : (
            <CmsLink href={ctaHref} label={ctaLabel} variant={dark ? "light" : "primary"} />
          )}
        </div>
      </div>
    </SectionShell>
  );
}

function FaqSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const s = parseSettings(section.settings);
  const items = settingItems<{ question?: string; answer?: string }>(s, "items");

  return (
    <SectionShell section={section}>
      <div className="portal-container max-w-3xl">
        <StandardSectionCopy copy={copy} />
        <dl className="mt-10 space-y-4">
          {items.length === 0 ? (
            <p className={`text-sm ${cardEmptyState}`}>
              Add questions in section settings (items JSON).
            </p>
          ) : null}
          {items.map((item, i) => (
            <div key={i} className={cardFaqItem}>
              {item.question ? (
                <dt className="font-semibold text-[var(--ink)]">{item.question}</dt>
              ) : null}
              {item.answer ? (
                <dd className="mt-1.5 text-sm leading-snug text-[var(--muted)]">
                  {item.answer}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>
    </SectionShell>
  );
}

function StatsSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const s = parseSettings(section.settings);
  const items = settingItems<{ value?: string; label?: string }>(s, "items");

  return (
    <SectionShell section={section} className="bg-white border-y border-[var(--line)]">
      <div className="portal-container">
        {copy.headline ? (
          <h2 className="text-center headline-stack text-3xl sm:text-4xl">
            {copy.headline}
          </h2>
        ) : null}
        {items.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
              <div key={i} className="text-center">
                {item.value ? (
                  <p className="text-4xl font-semibold tracking-tight text-[var(--ink)]">
                    {item.value}
                  </p>
                ) : null}
                {item.label ? (
                  <p className="mt-2 text-sm text-[var(--muted)]">{item.label}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className={`mt-10 text-center text-sm ${cardEmptyState}`}>
            Add stats in section settings (items JSON).
          </p>
        )}
      </div>
    </SectionShell>
  );
}

function CardGridSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const s = parseSettings(section.settings);
  const cards = settingItems<{
    title?: string;
    body?: string;
    image_url?: string;
    link_label?: string;
    link_href?: string;
  }>(s, "cards");

  return (
    <SectionShell section={section}>
      <div className="portal-container">
        <StandardSectionCopy copy={copy} />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <article key={i} className={cardGridArticle}>
              <div className="aspect-[16/10] overflow-hidden bg-[var(--cream-dark)]">
                {card.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={card.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
                    Image
                  </div>
                )}
              </div>
              <div className={cardGridBody}>
                {card.title ? (
                  <h3 className="text-lg font-semibold leading-snug">{card.title}</h3>
                ) : null}
                {card.body ? (
                  <p className="flex-1 text-sm leading-snug text-[var(--muted)]">
                    {card.body}
                  </p>
                ) : null}
                {card.link_label && card.link_href ? (
                  <div className="mt-3">
                    <CmsLink
                      href={card.link_href}
                      label={card.link_label}
                      variant="secondary"
                    />
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function InventoryCollectionSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const vehicles = section.vehicles ?? [];

  return (
    <SectionShell section={section}>
      <div className="portal-container mb-8">
        {copy.headline ? (
          <h2 className="headline-stack text-3xl sm:text-4xl">{copy.headline}</h2>
        ) : (
          <h2 className="headline-stack text-3xl sm:text-4xl">Featured inventory</h2>
        )}
        {copy.subheadline ? (
          <p className="mt-3 max-w-xl text-[var(--muted)]">{copy.subheadline}</p>
        ) : null}
        <Link
          href="/inventory"
          className="mt-6 inline-block text-sm font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
        >
          Browse all inventory →
        </Link>
      </div>
      {vehicles.length === 0 ? (
        <div className="portal-container">
          <p className={cardEmptyState}>
            No vehicles in this collection right now.
          </p>
        </div>
      ) : (
        <div className="rail-scroll portal-container lg:max-w-none">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} variant="rail" />
          ))}
        </div>
      )}
    </SectionShell>
  );
}

function LocationsSection({
  section,
  copy,
  stores,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
  stores: Store[];
}) {
  const headline = copy.headline || "Our locations";
  const subheadline = copy.subheadline;

  return (
    <SectionShell section={section} className="border-t border-[var(--line)] bg-white">
      <div className="portal-container">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--muted)]">
          {headline}
        </p>
        {subheadline ? (
          <p className="mx-auto mt-3 max-w-lg text-center text-[var(--muted)]">
            {subheadline}
          </p>
        ) : null}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div key={store.id} className={cardLocation}>
              <p className="text-lg font-semibold text-[var(--ink)]">{store.name}</p>
              {(store.city || store.state) && (
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {[store.city, store.state].filter(Boolean).join(", ")}
                </p>
              )}
              {store.phone ? (
                <a
                  href={`tel:${store.phone.replace(/\D/g, "")}`}
                  className="mt-4 inline-block text-sm font-medium text-[var(--ink)] hover:text-[var(--gold)]"
                >
                  {store.phone}
                </a>
              ) : null}
              {store.website ? (
                <a
                  href={store.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-sm text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  Visit website →
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function CustomHtmlSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const s = parseSettings(section.settings);
  const raw = settingString(s, "html") || copy.body;
  const safe = isProbablySafeHtml(raw) ? sanitizeCmsHtml(raw) : null;
  const plainBody = !safe && copy.body;

  return (
    <SectionShell section={section}>
      <div className="portal-container max-w-3xl">
        {copy.headline ? (
          <h2 className="mb-6 headline-stack text-2xl sm:text-3xl">{copy.headline}</h2>
        ) : null}
        {safe ? (
          <div
            className="prose-cms space-y-4 text-[var(--muted)] leading-relaxed [&_a]:text-[var(--ink)] [&_a]:underline [&_h3]:font-semibold [&_h3]:text-[var(--ink)]"
            dangerouslySetInnerHTML={{ __html: safe }}
          />
        ) : plainBody ? (
          <SectionBodyText body={plainBody} className="mt-0" />
        ) : (
          <div className={cardEmpty}>
            Custom content is unavailable or did not pass safety checks.
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function GenericSection({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  if (
    !copy.headline &&
    !copy.subheadline &&
    !copy.body &&
    !copy.eyebrow &&
    !copy.imageUrl
  ) {
    return null;
  }

  const entry = getRegistryEntry(section.section_type);

  return (
    <SectionShell section={section}>
      <div className="portal-container max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          {entry.label} ({section.section_type})
        </p>
        <StandardSectionCopy copy={copy} />
        {copy.imageUrl ? (
          <div className={`${cardImageFrame} mt-8 aspect-[16/10] max-w-xl`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={copy.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

function CMSSectionBlock({
  section,
  copy,
}: {
  section: EnrichedCMSSection;
  copy: SectionCopy;
}) {
  const stores = section.stores ?? [];
  const presetKey = getPresetKeyFromSettings(section.settings);

  if (presetKey && isSavedSectionPreset(presetKey)) {
    return <PresetPageSectionRenderer section={section} presetKey={presetKey} />;
  }

  if (!registryHasDedicatedRenderer(section.section_type)) {
    return <GenericSection section={section} copy={copy} />;
  }

  switch (section.section_type) {
    case "hero":
      return <HeroSection section={section} copy={copy} />;
    case "text_block":
      return <TextBlockSection section={section} copy={copy} />;
    case "image_text":
      return <ImageTextSection section={section} copy={copy} />;
    case "split_feature":
      return <SplitFeatureSection section={section} copy={copy} />;
    case "cta_band":
      return <CtaBandSection section={section} copy={copy} />;
    case "faq":
      return <FaqSection section={section} copy={copy} />;
    case "stats":
      return <StatsSection section={section} copy={copy} />;
    case "card_grid":
      return <CardGridSection section={section} copy={copy} />;
    case "inventory_collection":
      return <InventoryCollectionSection section={section} copy={copy} />;
    case "form":
      return <CMSFormSection section={section} />;
    case "locations":
      return <LocationsSection section={section} copy={copy} stores={stores} />;
    case "custom_html":
      return <CustomHtmlSection section={section} copy={copy} />;
    default:
      return <GenericSection section={section} copy={copy} />;
  }
}

interface CMSSectionRendererProps {
  sections: EnrichedCMSSection[];
}

export function CMSSectionRenderer({ sections }: CMSSectionRendererProps) {
  const { locale } = useLanguage();
  const localizedSections = useMemo(
    () => localizeCMSSections(sections, locale),
    [sections, locale],
  );

  if (localizedSections.length === 0) {
    return (
      <div className="portal-container py-20 text-center text-[var(--muted)]">
        This page has no sections yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {localizedSections.map((section) => (
        <CMSSectionBlock
          key={section.id}
          section={section}
          copy={getSectionCopy(section)}
        />
      ))}
    </div>
  );
}
