import Link from "next/link";
import { OurStoryTimeline } from "@/components/our-story/OurStoryTimeline";
import { OurStoryVideo } from "@/components/our-story/OurStoryVideo";
import { OUR_STORY_PAGE_CONTENT } from "@/lib/ourStoryPageContent";
import type { OurStoryPageContent } from "@/lib/ourStoryPageContent";

import "@/app/our-story-page.css";

interface OurStoryPageViewProps {
  content?: OurStoryPageContent;
}

export function OurStoryPageView({
  content = OUR_STORY_PAGE_CONTENT,
}: OurStoryPageViewProps) {
  const { hero, video, timeline, legacy, cta } = content;

  return (
    <div className="story-page">
      <section className="story-hero" aria-labelledby="story-hero-title">
        <div className="story-hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.imageUrl} alt="" className="story-hero__img" />
          <div className="story-hero__overlay" aria-hidden />
        </div>
        <div className="portal-container story-hero__content">
          <p className="story-hero__eyebrow">Cavender Auto Group</p>
          <h1 id="story-hero-title" className="story-hero__title">
            {hero.title}
          </h1>
          <p className="story-hero__subtitle">{hero.subtitle}</p>
          <p className="story-hero__supporting">{hero.supportingLine}</p>
          <span className="story-hero__rule" aria-hidden />
        </div>
      </section>

      <OurStoryVideo video={video} />

      <OurStoryTimeline
        eyebrow={timeline.eyebrow}
        title={timeline.title}
        milestones={timeline.milestones}
      />

      <section className="story-legacy" aria-labelledby="story-legacy-heading">
        <div className="portal-container">
          <h2 id="story-legacy-heading" className="story-legacy__heading">
            {legacy.heading}
          </h2>
          <p className="story-legacy__body">{legacy.body}</p>
          <ul className="story-legacy__values">
            {legacy.values.map((value) => (
              <li key={value.id} className="story-legacy__value">
                <h3 className="story-legacy__value-title">{value.title}</h3>
                <p className="story-legacy__value-desc">{value.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="story-cta" aria-labelledby="story-cta-heading">
        <div className="portal-container">
          <h2 id="story-cta-heading" className="story-cta__heading">
            {cta.heading}
          </h2>
          <div className="story-cta__actions">
            {cta.buttons.map((button, index) => (
              <Link
                key={button.id}
                href={button.href}
                className={`story-cta__btn ${
                  index === 0 ? "story-cta__btn--primary" : "story-cta__btn--secondary"
                }`}
              >
                {button.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
