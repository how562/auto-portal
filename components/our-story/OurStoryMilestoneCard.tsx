"use client";

import Link from "next/link";
import type { OurStoryMilestone } from "@/lib/ourStoryPageContent";
import { useStoryReveal } from "@/components/our-story/useStoryReveal";

export function OurStoryMilestoneCard({
  milestone,
  reverse = false,
}: {
  milestone: OurStoryMilestone;
  reverse?: boolean;
}) {
  const { ref, className: revealClass } = useStoryReveal<HTMLElement>();
  const hasLink = Boolean(milestone.linkLabel?.trim() && milestone.linkUrl?.trim());
  const hasImage = Boolean(milestone.imageUrl?.trim());
  const isFinale = milestone.variant === "finale";

  return (
    <article
      ref={ref}
      className={`story-timeline-card story-timeline-card--reveal ${revealClass} ${
        reverse ? "story-timeline-card--reverse" : ""
      } ${isFinale ? "story-timeline-card--finale" : ""}`}
      aria-labelledby={`milestone-${milestone.id}-title`}
    >
      <div className="story-timeline-card__body">
        {milestone.generation ? (
          <p className="story-timeline-card__generation">{milestone.generation}</p>
        ) : null}
        {milestone.year ? (
          <p className="story-timeline-card__year" aria-hidden>
            {milestone.year}
          </p>
        ) : null}
        <p className="story-timeline-card__eyebrow">{milestone.eyebrow}</p>
        <h3 id={`milestone-${milestone.id}-title`} className="story-timeline-card__title">
          {milestone.title}
        </h3>
        <p className="story-timeline-card__desc">{milestone.description}</p>
        {hasLink ? (
          <Link href={milestone.linkUrl} className="story-timeline-card__link">
            {milestone.linkLabel}
          </Link>
        ) : null}
      </div>
      <figure className="story-timeline-card__media story-timeline-card__figure">
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={milestone.imageUrl} alt={milestone.imageAlt} loading="lazy" />
        ) : (
          <div className="story-timeline-card__placeholder" role="img" aria-label={milestone.imageAlt}>
            <span className="story-timeline-card__placeholder-label">Historic archive</span>
            <span className="story-timeline-card__placeholder-caption">
              {milestone.imageAlt || milestone.title}
            </span>
          </div>
        )}
      </figure>
    </article>
  );
}
