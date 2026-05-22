"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { CMSFormSection } from "@/components/cms/CMSFormSection";
import { localizePageSections } from "@/lib/cmsSectionI18n";
import { VehicleCard } from "@/components/portal/VehicleCard";
import { parseSettings, settingItems, settingString } from "@/lib/cmsSettings";
import type { EnrichedPageSection } from "@/lib/cmsTypes";
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
  children,
  className = "",
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section
      className={`section-pad-tight ${dark ? "bg-[var(--charcoal)] text-white" : ""} ${className}`.trim()}
    >
      {children}
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
  const className =
    variant === "primary"
      ? btnPrimaryMd
      : variant === "light"
        ? btnLightMd
        : btnSecondaryMd;

  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} className={className} rel="noopener noreferrer">
      {label}
    </a>
  );
}

function HeroSection({ section }: { section: EnrichedPageSection }) {
  const s = parseSettings(section.settings);
  const eyebrow = settingString(s, "eyebrow") || section.subtitle || "";
  const headline = settingString(s, "headline") || section.title || "";
  const subheadline = settingString(s, "subheadline") || section.content || "";
  const imageUrl = settingString(s, "image_url");
  const ctaLabel = settingString(s, "cta_label");
  const ctaHref = settingString(s, "cta_href", "/inventory");
  const dark = settingString(s, "variant") === "dark";

  return (
    <SectionShell dark={dark}>
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
            {eyebrow ? (
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.25em] ${
                  dark ? "text-[var(--gold-soft)]" : "text-[var(--gold)]"
                }`}
              >
                {eyebrow}
              </p>
            ) : null}
            {headline ? (
              <h1 className="mt-4 headline-stack text-4xl sm:text-5xl lg:text-6xl">
                {headline}
              </h1>
            ) : null}
            {subheadline ? (
              <p
                className={`mt-6 max-w-xl text-lg leading-relaxed ${
                  dark ? "text-white/70" : "text-[var(--muted)]"
                }`}
              >
                {subheadline}
              </p>
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

function TextBlockSection({ section }: { section: EnrichedPageSection }) {
  const s = parseSettings(section.settings);
  const align = settingString(s, "alignment", "left");
  const body = section.content ?? settingString(s, "body");
  const title = section.title;

  return (
    <SectionShell>
      <div className="portal-container">
        <div
          className={`mx-auto max-w-3xl ${align === "center" ? "text-center" : ""}`}
        >
          {title ? (
            <h2 className="headline-stack text-3xl sm:text-4xl">{title}</h2>
          ) : null}
          {section.subtitle ? (
            <p className="mt-3 text-[var(--muted)]">{section.subtitle}</p>
          ) : null}
          {body ? (
            <div className="mt-6 space-y-4 text-base leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
              {body}
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}

function ImageTextSection({ section }: { section: EnrichedPageSection }) {
  const s = parseSettings(section.settings);
  const imageUrl = settingString(s, "image_url");
  const position = settingString(s, "image_position", "right");
  const body = section.content ?? settingString(s, "body");
  const imageFirst = position === "left";

  return (
    <SectionShell>
      <div className="portal-container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className={imageFirst ? "lg:order-2" : ""}>
            {section.title ? (
              <h2 className="headline-stack text-3xl sm:text-4xl">{section.title}</h2>
            ) : null}
            {section.subtitle ? (
              <p className="mt-3 text-sm font-medium text-[var(--gold)]">
                {section.subtitle}
              </p>
            ) : null}
            {body ? (
              <p className="mt-6 text-base leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
                {body}
              </p>
            ) : null}
          </div>
          <div
            className={`${cardImageFrame} aspect-[4/3] ${
              imageFirst ? "lg:order-1" : ""
            }`}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
                Image
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function SplitFeatureSection({ section }: { section: EnrichedPageSection }) {
  const s = parseSettings(section.settings);
  const imageUrl = settingString(s, "image_url");
  const items = settingItems<{ title?: string; body?: string }>(s, "items");
  const leftTitle = settingString(s, "left_title") || items[0]?.title;
  const leftBody = settingString(s, "left_body") || items[0]?.body;
  const rightTitle = settingString(s, "right_title") || items[1]?.title;
  const rightBody = settingString(s, "right_body") || items[1]?.body;

  return (
    <SectionShell className="bg-white">
      <div className="portal-container">
        {section.title ? (
          <h2 className="mb-10 text-center headline-stack text-3xl sm:text-4xl">
            {section.title}
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
            ) : null}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function CtaBandSection({ section }: { section: EnrichedPageSection }) {
  const s = parseSettings(section.settings);
  const headline = section.title ?? settingString(s, "headline");
  const subheadline = section.subtitle ?? settingString(s, "subheadline");
  const ctaLabel = settingString(s, "cta_label", "Get started");
  const ctaHref = settingString(s, "cta_href", "/inventory");
  const dark = settingString(s, "variant") !== "light";

  return (
    <SectionShell dark={dark}>
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
        <div className="mt-8 flex justify-center">
          <CmsLink href={ctaHref} label={ctaLabel} variant={dark ? "light" : "primary"} />
        </div>
      </div>
    </SectionShell>
  );
}

function FaqSection({ section }: { section: EnrichedPageSection }) {
  const s = parseSettings(section.settings);
  const items = settingItems<{ question?: string; answer?: string }>(s, "items");

  return (
    <SectionShell>
      <div className="portal-container max-w-3xl">
        {section.title ? (
          <h2 className="headline-stack text-3xl sm:text-4xl">{section.title}</h2>
        ) : null}
        {section.subtitle ? (
          <p className="mt-3 text-[var(--muted)]">{section.subtitle}</p>
        ) : null}
        <dl className="mt-10 space-y-4">
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

function StatsSection({ section }: { section: EnrichedPageSection }) {
  const s = parseSettings(section.settings);
  const items = settingItems<{ value?: string; label?: string }>(s, "items");

  return (
    <SectionShell className="bg-white border-y border-[var(--line)]">
      <div className="portal-container">
        {section.title ? (
          <h2 className="text-center headline-stack text-3xl sm:text-4xl">
            {section.title}
          </h2>
        ) : null}
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
      </div>
    </SectionShell>
  );
}

function CardGridSection({ section }: { section: EnrichedPageSection }) {
  const s = parseSettings(section.settings);
  const cards = settingItems<{
    title?: string;
    body?: string;
    image_url?: string;
    link_label?: string;
    link_href?: string;
  }>(s, "cards");

  return (
    <SectionShell>
      <div className="portal-container">
        {section.title ? (
          <h2 className="headline-stack text-3xl sm:text-4xl">{section.title}</h2>
        ) : null}
        {section.subtitle ? (
          <p className="mt-3 max-w-xl text-[var(--muted)]">{section.subtitle}</p>
        ) : null}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <article key={i} className={cardGridArticle}>
              {card.image_url ? (
                <div className="aspect-[16/10] overflow-hidden bg-[var(--cream-dark)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : null}
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
}: {
  section: EnrichedPageSection;
}) {
  const vehicles = section.vehicles ?? [];

  return (
    <SectionShell>
      <div className="portal-container mb-8">
        {section.title ? (
          <h2 className="headline-stack text-3xl sm:text-4xl">{section.title}</h2>
        ) : (
          <h2 className="headline-stack text-3xl sm:text-4xl">Featured inventory</h2>
        )}
        {section.subtitle ? (
          <p className="mt-3 max-w-xl text-[var(--muted)]">{section.subtitle}</p>
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
  stores,
}: {
  section: EnrichedPageSection;
  stores: Store[];
}) {
  const headline = section.title ?? "Our locations";
  const subheadline = section.subtitle;

  return (
    <SectionShell className="border-t border-[var(--line)] bg-white">
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

function CustomHtmlSection({ section }: { section: EnrichedPageSection }) {
  const s = parseSettings(section.settings);
  const raw =
    settingString(s, "html") || section.content || "";
  const safe = isProbablySafeHtml(raw) ? sanitizeCmsHtml(raw) : null;

  return (
    <SectionShell>
      <div className="portal-container max-w-3xl">
        {section.title ? (
          <h2 className="mb-6 headline-stack text-2xl sm:text-3xl">{section.title}</h2>
        ) : null}
        {safe ? (
          <div
            className="prose-cms space-y-4 text-[var(--muted)] leading-relaxed [&_a]:text-[var(--ink)] [&_a]:underline [&_h3]:font-semibold [&_h3]:text-[var(--ink)]"
            dangerouslySetInnerHTML={{ __html: safe }}
          />
        ) : (
          <div className={cardEmpty}>
            Custom content is unavailable or did not pass safety checks.
          </div>
        )}
      </div>
    </SectionShell>
  );
}

function UnknownSection() {
  return null;
}

function CMSSectionBlock({ section }: { section: EnrichedPageSection }) {
  const stores = section.stores ?? [];

  switch (section.section_type) {
    case "hero":
      return <HeroSection section={section} />;
    case "text_block":
      return <TextBlockSection section={section} />;
    case "image_text":
      return <ImageTextSection section={section} />;
    case "split_feature":
      return <SplitFeatureSection section={section} />;
    case "cta_band":
      return <CtaBandSection section={section} />;
    case "faq":
      return <FaqSection section={section} />;
    case "stats":
      return <StatsSection section={section} />;
    case "card_grid":
      return <CardGridSection section={section} />;
    case "inventory_collection":
      return <InventoryCollectionSection section={section} />;
    case "form":
      return <CMSFormSection section={section} />;
    case "locations":
      return <LocationsSection section={section} stores={stores} />;
    case "custom_html":
      return <CustomHtmlSection section={section} />;
    default:
      return <UnknownSection />;
  }
}

interface CMSSectionRendererProps {
  sections: EnrichedPageSection[];
}

export function CMSSectionRenderer({ sections }: CMSSectionRendererProps) {
  const { locale } = useLanguage();
  const localizedSections = useMemo(
    () => localizePageSections(sections, locale),
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
        <CMSSectionBlock key={section.id} section={section} />
      ))}
    </div>
  );
}
