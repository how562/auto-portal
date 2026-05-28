import { StoryCard } from "@/components/stories/StoryCard";
import type { CavenderStory, StoryCategory } from "@/lib/storiesContent";
import { STORY_CATEGORY_LABELS } from "@/lib/storiesContent";

export function StoryCategorySection({
  category,
  stories,
}: {
  category: StoryCategory;
  stories: CavenderStory[];
}) {
  if (stories.length === 0) return null;

  return (
    <section className="stories-section" aria-labelledby={`stories-cat-${category}`}>
      <div className="portal-container">
        <h2 id={`stories-cat-${category}`} className="stories-section__heading">
          {STORY_CATEGORY_LABELS[category]}
        </h2>
        <div className="stories-grid stories-grid--4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} showExcerpt={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
