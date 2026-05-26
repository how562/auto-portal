"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ExploreBrand } from "@/lib/exploreBrands";

const MARQUEE_COPIES = 2;
const LOGO_HEIGHT = "h-28 sm:h-32 md:h-36 lg:h-40";
const LOGO_SLOT_W = "w-[10.5rem] sm:w-[12rem] md:w-[13rem] lg:w-[15rem]";
const LOGO_MAX_W = "max-w-[10.5rem] sm:max-w-[12rem] md:max-w-[13rem] lg:max-w-[15rem]";

interface BrandLogoCarouselProps {
  brands: ExploreBrand[];
}

interface TooltipAnchor {
  brand: ExploreBrand;
  x: number;
  y: number;
}

function BrandLogoTooltip({ anchor }: { anchor: TooltipAnchor }) {
  const { brand } = anchor;
  const dealership =
    brand.dealershipName ?? brand.locationText.split("·")[0]?.trim();
  const location = brand.locationText.includes("·")
    ? brand.locationText.split("·").slice(1).join("·").trim()
    : brand.locationText;

  const viewportWidth =
    typeof window !== "undefined" ? window.innerWidth : 1200;
  const cardWidth = Math.min(256, viewportWidth - 24);
  const half = cardWidth / 2;
  const left = Math.min(
    Math.max(anchor.x, 12 + half),
    viewportWidth - 12 - half,
  );

  return (
    <div
      role="tooltip"
      id={`brand-tip-${brand.id}`}
      className="pointer-events-none fixed z-[200] max-md:hidden"
      style={{
        left,
        top: anchor.y,
        width: cardWidth,
        transform: "translate(-50%, calc(-100% - 10px))",
      }}
    >
      <div className="relative rounded-md border border-[var(--line)]/80 bg-white px-4 py-3 text-left shadow-[var(--shadow-card)]">
        <p className="text-sm font-semibold text-[var(--ink)]">{brand.brandName}</p>
        {dealership ? (
          <p className="mt-0.5 text-xs text-[var(--ink)]/85">{dealership}</p>
        ) : null}
        {location ? (
          <p className="mt-0.5 text-xs text-[var(--muted)]">{location}</p>
        ) : null}
        <p className="mt-2 text-xs font-semibold text-[var(--ink)]">
          View Inventory →
        </p>
        <span
          className="absolute -bottom-1.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-[var(--line)]/80 bg-white"
          aria-hidden
        />
      </div>
    </div>
  );
}

function BrandLogoItem({
  brand,
  onTooltipShow,
  onTooltipHide,
}: {
  brand: ExploreBrand;
  onTooltipShow: (brand: ExploreBrand, el: HTMLElement) => void;
  onTooltipHide: () => void;
}) {
  const dealership =
    brand.dealershipName ?? brand.locationText.split("·")[0]?.trim();

  return (
    <li className="group/logo flex shrink-0 items-center">
      <Link
        href={brand.inventoryUrl}
        className="relative flex flex-col items-center rounded-md px-2.5 outline-none transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-4 motion-safe:hover:scale-[1.03] motion-safe:focus-visible:scale-[1.03] hover:brightness-[1.04] focus-visible:brightness-[1.04]"
        aria-label={`${brand.brandName} inventory at ${dealership}`}
        onMouseEnter={(e) => onTooltipShow(brand, e.currentTarget)}
        onMouseLeave={onTooltipHide}
        onFocus={(e) => onTooltipShow(brand, e.currentTarget)}
        onBlur={onTooltipHide}
      >
        <span
          className={`flex ${LOGO_HEIGHT} ${LOGO_SLOT_W} items-center justify-center`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brand.logoUrl}
            alt=""
            width={288}
            height={208}
            className={`${LOGO_MAX_W} max-h-full w-auto object-contain`}
          />
        </span>
      </Link>
    </li>
  );
}

function BrandMarqueeStrip({
  brands,
  copyIndex,
  ariaHidden,
  onTooltipShow,
  onTooltipHide,
}: {
  brands: ExploreBrand[];
  copyIndex: number;
  ariaHidden?: boolean;
  onTooltipShow: (brand: ExploreBrand, el: HTMLElement) => void;
  onTooltipHide: () => void;
}) {
  return (
    <ul
      className={`flex shrink-0 items-center ${copyIndex > 0 ? "motion-reduce:hidden" : ""}`}
      aria-hidden={ariaHidden || undefined}
    >
      {brands.map((brand) => (
        <BrandLogoItem
          key={`${brand.id}-${copyIndex}`}
          brand={brand}
          onTooltipShow={onTooltipShow}
          onTooltipHide={onTooltipHide}
        />
      ))}
    </ul>
  );
}

export function BrandLogoCarousel({ brands }: BrandLogoCarouselProps) {
  const [paused, setPaused] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipAnchor | null>(null);
  const [mounted, setMounted] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const duration = useMemo(() => {
    const seconds = Math.max(56, brands.length * 9);
    return `${seconds}s`;
  }, [brands.length]);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const showTooltip = useCallback((brand: ExploreBrand, el: HTMLElement) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const rect = el.getBoundingClientRect();
    setTooltip({
      brand,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }, []);

  const hideTooltip = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setTooltip(null), 80);
  }, []);

  if (brands.length === 0) return null;

  return (
    <>
      <div
        className={`brand-marquee-viewport homepage-brand-marquee relative w-full overflow-hidden py-2 sm:py-3 ${
          paused ? "brand-marquee-paused" : ""
        }`}
        role="region"
        aria-roledescription="carousel"
        aria-label="Automotive brands in the Cavender network"
        style={{ ["--brand-marquee-duration" as string]: duration }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => {
          setPaused(false);
          hideTooltip();
        }}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setPaused(false);
            setTooltip(null);
          }
        }}
      >
        <div className="brand-marquee-reduced flex w-max min-w-full motion-reduce:w-full motion-reduce:justify-center">
          <div className="brand-marquee-track flex w-max items-center gap-x-1 sm:gap-x-2 motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-4">
            {Array.from({ length: MARQUEE_COPIES }, (_, copyIndex) => (
              <BrandMarqueeStrip
                key={copyIndex}
                brands={brands}
                copyIndex={copyIndex}
                ariaHidden={copyIndex > 0}
                onTooltipShow={showTooltip}
                onTooltipHide={hideTooltip}
              />
            ))}
          </div>
        </div>
      </div>

      {mounted && tooltip
        ? createPortal(
            <BrandLogoTooltip anchor={tooltip} />,
            document.body,
          )
        : null}
    </>
  );
}
