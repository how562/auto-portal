import type { OurStoryMilestone } from "@/lib/ourStoryPageContent";
import { OurStoryMilestoneCard } from "@/components/our-story/OurStoryMilestoneCard";

export function OurStoryTimelineVertical({
  milestones,
}: {
  milestones: OurStoryMilestone[];
}) {
  return (
    <div className="story-timeline-vertical portal-container">
      <ol className="story-timeline-vertical__list">
        {milestones.map((milestone, index) => (
          <li key={milestone.id} className="story-timeline-vertical__item">
            <OurStoryMilestoneCard milestone={milestone} reverse={index % 2 === 1} />
          </li>
        ))}
      </ol>
    </div>
  );
}
