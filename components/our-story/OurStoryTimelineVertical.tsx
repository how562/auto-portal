"use client";

import type { OurStoryMilestone } from "@/lib/ourStoryPageContent";
import { OurStoryMilestoneCard } from "@/components/our-story/OurStoryMilestoneCard";

export function OurStoryTimelineVertical({
  milestones,
  finaleTagline,
}: {
  milestones: OurStoryMilestone[];
  finaleTagline?: string;
}) {
  return (
    <div className="story-timeline-vertical portal-container">
      <ol className="story-timeline-vertical__list">
        {milestones.map((milestone, index) => (
          <li
            key={milestone.id}
            className={`story-timeline-vertical__item ${
              index % 2 === 1 ? "story-timeline-vertical__item--alt" : ""
            } ${milestone.variant === "finale" ? "story-timeline-vertical__item--finale" : ""}`}
          >
            <span className="story-timeline-vertical__marker" aria-hidden />
            <span className="story-timeline-vertical__index">
              {milestone.shortLabel ?? milestone.year}
            </span>
            <OurStoryMilestoneCard milestone={milestone} reverse={index % 2 === 1} />
          </li>
        ))}
      </ol>
      {finaleTagline ? (
        <p className="story-timeline-vertical__finale">{finaleTagline}</p>
      ) : null}
    </div>
  );
}
