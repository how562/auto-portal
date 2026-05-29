import {
  AboutUsFeatureIcon,
  AboutUsValueIcon,
} from "@/components/pages/AboutUsIcons";
import { PageHeaderRenderer } from "@/components/page-headers/PageHeaderRenderer";
import {
  ABOUT_US_PAGE_CONTENT,
  type AboutUsPageContent,
} from "@/lib/aboutUsPageContent";
import { resolvePageHeader } from "@/lib/pageHeaderResolve";

import "@/app/about-us-page.css";

interface AboutUsPageProps {
  content?: AboutUsPageContent;
}

export function AboutUsPage({ content = ABOUT_US_PAGE_CONTENT }: AboutUsPageProps) {
  const { whoWeAre, ourApproach, ourValues } = content;
  const header = resolvePageHeader("about-us", content);

  return (
    <div className="about-us-page">
      <PageHeaderRenderer header={header} />

      {/* Who We Are */}
      <section className="about-us-band about-us-band--white" aria-labelledby="about-us-who-title">
        <div className="portal-container about-us-split">
          <div className="about-us-split__copy">
            <p className="about-us-eyebrow">{whoWeAre.eyebrow}</p>
            <h2 id="about-us-who-title" className="about-us-headline">
              {whoWeAre.headline}{" "}
              <span className="about-us-headline-accent">{whoWeAre.headlineAccent}</span>
            </h2>
            <div className="about-us-body">
              {whoWeAre.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
            <p className="about-us-signature">{whoWeAre.signature}</p>
          </div>
          <div className="about-us-split__media">
            <div className="about-us-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={whoWeAre.imageUrl} alt="" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section
        className="about-us-band about-us-band--gray"
        aria-labelledby="about-us-approach-title"
      >
        <div className="portal-container about-us-split about-us-split--reverse">
          <div className="about-us-split__media">
            <div className="about-us-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ourApproach.imageUrl} alt="" />
            </div>
          </div>
          <div className="about-us-split__copy">
            <p className="about-us-eyebrow">{ourApproach.eyebrow}</p>
            <h2 id="about-us-approach-title" className="about-us-headline">
              {ourApproach.headline}
            </h2>
            <ul className="about-us-features">
              {ourApproach.features.map((feature) => (
                <li key={feature.id} className="about-us-feature">
                  <AboutUsFeatureIcon type={feature.icon} />
                  <div>
                    <h3 className="about-us-feature__title">{feature.title}</h3>
                    <p className="about-us-feature__desc">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="about-us-band about-us-band--white" aria-labelledby="about-us-values-title">
        <div className="portal-container about-us-values">
          <div className="about-us-values__header">
            <p className="about-us-values__eyebrow">
              <span className="about-us-values__eyebrow-line" aria-hidden />
              {ourValues.eyebrow}
              <span className="about-us-values__eyebrow-line" aria-hidden />
            </p>
            <h2 id="about-us-values-title" className="about-us-values__headline">
              {ourValues.headline}
            </h2>
          </div>
          <ul className="about-us-values__grid">
            {ourValues.items.map((item, index) => (
              <li
                key={item.id}
                className={`about-us-value${index > 0 ? " about-us-value--divider" : ""}`}
              >
                <AboutUsValueIcon type={item.icon} />
                <h3 className="about-us-value__title">{item.title}</h3>
                <p className="about-us-value__desc">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
