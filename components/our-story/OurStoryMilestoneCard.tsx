import Link from "next/link";
import type { OurStoryMilestone } from "@/lib/ourStoryPageContent";

export function OurStoryMilestoneCard({
  milestone,
  reverse = false,
}: {
  milestone: OurStoryMilestone;
  reverse?: boolean;
}) {
  const hasLink = Boolean(milestone.linkLabel?.trim() && milestone.linkUrl?.trim());

  return (
    <article
      className={`story-timeline-card ${reverse ? "story-timeline-card--reverse" : ""}`}
      aria-labelledby={`milestone-${milestone.id}-title`}
    >
      <div className="story-timeline-card__body">
        <p className="story-timeline-card__year" aria-hidden>
          {milestone.year}
        </p>
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={milestone.imageUrl} alt={milestone.imageAlt} />
      </figure>
    </article>
  );
}
