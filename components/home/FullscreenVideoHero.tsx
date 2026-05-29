"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { HomepageInventorySearchBridge } from "@/components/home/HomepageInventorySearchBridge";
import { usePortalText } from "@/components/providers/TextSettingsProvider";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import { localizeCommunityHero } from "@/lib/communityHeroI18n";
import { isGuidedDiscoveryHref } from "@/lib/communityHeroUtils";
import type { CommunityHeroContent } from "@/lib/communityHeroTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

import "@/app/fullscreen-video-hero.css";

interface FullscreenVideoHeroProps {
  content: CommunityHeroContent;
}

function useMobileOrReducedMotion(): boolean {
  const [preferStatic, setPreferStatic] = useState(false);

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 767px)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function update() {
      setPreferStatic(mqMobile.matches || mqMotion.matches);
    }

    update();
    mqMobile.addEventListener("change", update);
    mqMotion.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqMotion.removeEventListener("change", update);
    };
  }, []);

  return preferStatic;
}

function HeroCtaButtons({ content }: { content: CommunityHeroContent }) {
  const { scrollToGuided } = useDiscovery();
  const primaryClass = `${btnPrimaryMd} fs-video-hero__btn fs-video-hero__btn--primary`;
  const secondaryClass = `${btnSecondaryMd} fs-video-hero__btn fs-video-hero__btn--secondary`;

  return (
    <div className="fs-video-hero__actions">
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

export function FullscreenVideoHero({ content: rawContent }: FullscreenVideoHeroProps) {
  const { t, locale } = useLanguage();
  const preferStatic = useMobileOrReducedMotion();
  const content = useMemo(
    () => localizeCommunityHero(rawContent, locale),
    [rawContent, locale],
  );

  const { video } = content;
  const poster = video.posterImage.trim() || content.images[0]?.url || "/hero/dealership.jpg";
  const videoSrc = video.videoUrl.trim();
  const useVideo = Boolean(videoSrc) && !preferStatic;

  const cmsTitleFallback =
    content.headlineLines.map((line) => line.text).join(" ") ||
    `${t("hero.headline1")} ${t("hero.headline2")}`;
  const cmsSubtitleFallback =
    content.subheadline.trim() || content.body.trim() || t("hero.body");

  const portalTitle = usePortalText("homepage.title", cmsTitleFallback);
  const portalSubtitle = usePortalText("homepage.subtitle", cmsSubtitleFallback);

  const overlayStyle = useMemo(() => {
    const alpha = video.overlayOpacity;
    const rgb =
      video.overlayColor === "light" ? "255, 255, 255" : "9, 21, 38";
    return { backgroundColor: `rgba(${rgb}, ${alpha})` };
  }, [video.overlayColor, video.overlayOpacity]);

  const eyebrow = content.eyebrow.label.trim();

  return (
    <section
      className="fs-video-hero"
      aria-labelledby="fs-video-hero-title"
      data-overlay={video.overlayColor}
    >
      <div className="fs-video-hero__media" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={poster} alt="" className="fs-video-hero__poster" />
        {useVideo ? (
          <video
            className="fs-video-hero__video"
            autoPlay
            muted
            loop
            playsInline
            poster={poster}
          >
            <source src={videoSrc} />
          </video>
        ) : null}
        <div className="fs-video-hero__overlay" style={overlayStyle} />
      </div>

      <div className="fs-video-hero__content">
        <div className="portal-container fs-video-hero__inner">
          <div className="fs-video-hero__copy">
            <span className="fs-video-hero__accent" aria-hidden />
            {eyebrow ? (
              content.eyebrow.url.trim() ? (
                <a href={content.eyebrow.url} className="fs-video-hero__eyebrow">
                  {eyebrow}
                </a>
              ) : (
                <p className="fs-video-hero__eyebrow">{eyebrow}</p>
              )
            ) : null}
            <h1 id="fs-video-hero-title" className="fs-video-hero__title">
              {portalTitle}
            </h1>
            {portalSubtitle ? (
              <p className="fs-video-hero__subcopy">{portalSubtitle}</p>
            ) : null}
            {content.buttons.length > 0 ? <HeroCtaButtons content={content} /> : null}
          </div>

          {video.showInventorySearchBar ? (
            <div className="fs-video-hero__search">
              <HomepageInventorySearchBridge variant="video-hero" hideEyebrow hideHelperLine />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
