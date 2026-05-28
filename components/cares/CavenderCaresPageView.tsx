import { CAVENDER_CARES_PAGE_CONTENT } from "@/lib/cavenderCaresPageContent";
import type { CavenderCaresPageContent } from "@/lib/cavenderCaresPageContent";

import "@/app/cavender-cares-page.css";

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function contactLineWithLink(line: string) {
  const emailMatch = line.match(/[\w.+-]+@[\w.-]+\.\w+/);
  if (!emailMatch) return line;

  const email = emailMatch[0];
  const parts = line.split(email);
  return (
    <>
      {parts[0]}
      <a href={`mailto:${email}`}>{email}</a>
      {parts[1] ?? ""}
    </>
  );
}

interface CavenderCaresPageViewProps {
  content?: CavenderCaresPageContent;
}

export function CavenderCaresPageView({
  content = CAVENDER_CARES_PAGE_CONTENT,
}: CavenderCaresPageViewProps) {
  const introParagraphs = splitParagraphs(content.intro.body);

  return (
    <div className="cares-page">
      <section className="cares-hero" aria-labelledby="cares-hero-headline">
        <div className="cares-hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.hero.backgroundImageUrl}
            alt=""
            className="cares-hero__img"
          />
          <div className="cares-hero__overlay" aria-hidden />
        </div>
        <div className="cares-hero__content">
          {content.hero.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.hero.logoUrl}
              alt={content.hero.logoAlt}
              className="cares-hero__logo"
            />
          ) : (
            <p className="cares-hero__brand">{content.hero.logoAlt}</p>
          )}
          <h1 id="cares-hero-headline" className="cares-hero__headline">
            {content.hero.headline}
          </h1>
        </div>
      </section>

      <section className="cares-intro" aria-labelledby="cares-intro-heading">
        <div className="portal-container cares-intro__grid">
          <div>
            <h2 id="cares-intro-heading" className="cares-intro__heading">
              {content.intro.heading}
            </h2>
            <div className="cares-intro__body">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </div>
          <figure className="cares-intro__figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.intro.imageUrl} alt="" />
          </figure>
        </div>
      </section>

      <section className="cares-impact" aria-label="Impact highlights">
        <div className="portal-container">
          <ul className="cares-impact__list">
            {content.impact.map((stat) => (
              <li key={stat.id} className="cares-impact__item">
                <span className="cares-impact__value">{stat.value}</span>
                <span className="cares-impact__label">{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cares-partners" aria-label="Community partners">
        <div className="portal-container">
          <ul className="cares-partners__list">
            {content.partners.map((partner) => (
              <li key={partner.id} className="cares-partners__item">
                {partner.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="cares-partners__logo"
                  />
                ) : (
                  <span className="cares-partners__placeholder">{partner.name}</span>
                )}
              </li>
            ))}
          </ul>
          {content.partnersMoreLabel ? (
            <p className="cares-partners__more">{content.partnersMoreLabel}</p>
          ) : null}
        </div>
      </section>

      <section className="cares-gallery" aria-labelledby="cares-gallery-heading">
        <div className="portal-container">
          <h2 id="cares-gallery-heading" className="cares-gallery__heading">
            {content.gallery.heading}
          </h2>
          <div className="cares-gallery__top">
            {content.gallery.topRow.map((image) => (
              <figure key={image.id} className="cares-gallery__cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.imageUrl} alt={image.alt} />
              </figure>
            ))}
          </div>
          <div className="cares-gallery__bottom">
            {content.gallery.bottomRow.map((image) => (
              <figure key={image.id} className="cares-gallery__cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.imageUrl} alt={image.alt} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="cares-closing" aria-label="Cavender Cares story">
        <div className="portal-container cares-closing__inner">
          {content.closing.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="cares-contact" aria-label="Contact">
        <div className="portal-container">
          <p className="cares-contact__line">
            {contactLineWithLink(content.contact.line)}
          </p>
        </div>
      </section>
    </div>
  );
}
