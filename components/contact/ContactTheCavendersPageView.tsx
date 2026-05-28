import { ContactCavendersForm } from "@/components/contact/ContactCavendersForm";
import { CONTACT_THE_CAVENDERS_PAGE_CONTENT } from "@/lib/contactTheCavendersPageContent";
import type { ContactTheCavendersPageContent } from "@/lib/contactTheCavendersPageContent";

import "@/app/contact-the-cavenders-page.css";

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

interface ContactTheCavendersPageViewProps {
  content?: ContactTheCavendersPageContent;
}

export function ContactTheCavendersPageView({
  content = CONTACT_THE_CAVENDERS_PAGE_CONTENT,
}: ContactTheCavendersPageViewProps) {
  const introParagraphs = splitParagraphs(content.intro.body);

  return (
    <div className="contact-cavenders-page">
      <section className="contact-cavenders-hero" aria-labelledby="contact-cavenders-title">
        <div className="contact-cavenders-hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={content.hero.backgroundImageUrl}
            alt=""
            className="contact-cavenders-hero__img"
          />
          <div className="contact-cavenders-hero__overlay" aria-hidden />
        </div>
        <div className="contact-cavenders-hero__content">
          <h1 id="contact-cavenders-title" className="contact-cavenders-hero__title">
            {content.hero.title}
          </h1>
          <p className="contact-cavenders-hero__subtitle">{content.hero.subtitle}</p>
          <p className="contact-cavenders-hero__supporting">{content.hero.supportingText}</p>
          <span className="contact-cavenders-hero__rule" aria-hidden />
        </div>
      </section>

      <section className="contact-cavenders-main" aria-labelledby="contact-cavenders-intro">
        <div className="portal-container contact-cavenders-main__grid">
          <div className="contact-cavenders-intro">
            <h2 id="contact-cavenders-intro" className="contact-cavenders-intro__heading">
              {content.intro.heading}
            </h2>
            <div className="contact-cavenders-intro__body">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            <figure className="contact-cavenders-intro__figure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={content.intro.leadershipImageUrl}
                alt={content.intro.leadershipImageAlt}
              />
            </figure>
          </div>

          <ContactCavendersForm formContent={content.form} />
        </div>
      </section>

      {content.quote.text ? (
        <section className="contact-cavenders-quote" aria-label="Leadership quote">
          <div className="portal-container contact-cavenders-quote__inner">
            <blockquote>
              <p className="contact-cavenders-quote__text">&ldquo;{content.quote.text}&rdquo;</p>
              {content.quote.attribution ? (
                <cite className="contact-cavenders-quote__attr">{content.quote.attribution}</cite>
              ) : null}
            </blockquote>
          </div>
        </section>
      ) : null}
    </div>
  );
}
