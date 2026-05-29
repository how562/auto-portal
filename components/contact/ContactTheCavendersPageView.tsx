import { ContactCavendersForm } from "@/components/contact/ContactCavendersForm";
import { PageHeaderRenderer } from "@/components/page-headers/PageHeaderRenderer";
import { resolvePageHeader } from "@/lib/pageHeaderResolve";
import { CONTACT_THE_CAVENDERS_PAGE_CONTENT } from "@/lib/contactTheCavendersPageContent";
import type { ContactTheCavendersPageContent } from "@/lib/contactTheCavendersPageContent";

import "@/app/contact-the-cavenders-page.css";

interface ContactTheCavendersPageViewProps {
  content?: ContactTheCavendersPageContent;
}

export function ContactTheCavendersPageView({
  content = CONTACT_THE_CAVENDERS_PAGE_CONTENT,
}: ContactTheCavendersPageViewProps) {
  const { intro, form } = content;
  const header = resolvePageHeader("contact-the-cavenders", content);

  return (
    <div className="contact-cavenders-page">
      <PageHeaderRenderer header={header} />

      <section className="contact-cavenders-main" aria-label="Send a message">
        <div className="portal-container contact-cavenders-main__grid">
          <figure className="contact-cavenders-main__figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={intro.leadershipImageUrl}
              alt={intro.leadershipImageAlt}
            />
          </figure>
          <div className="contact-cavenders-main__form">
            <ContactCavendersForm formContent={form} />
          </div>
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
