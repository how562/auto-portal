import { StoryLink } from "@/components/stories/StoryLink";
import type { CavenderStory } from "@/lib/storiesContent";
import { formatStoryDate, storyCategoryLabel } from "@/lib/storiesContent";

export function StorySidebar({ stories }: { stories: CavenderStory[] }) {
  if (stories.length === 0) return null;

  return (
    <aside className="stories-sidebar" aria-label="More stories">
      {stories.map((story) => (
        <StoryLink key={story.id} story={story} className="stories-sidebar__item">
          <div className="stories-sidebar__thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.coverImage} alt={story.coverImageAlt} />
          </div>
          <div>
            <p className="stories-sidebar__category">{storyCategoryLabel(story.category)}</p>
            <h3 className="stories-sidebar__title">{story.title}</h3>
            <p className="stories-sidebar__date">
              <time dateTime={story.publishedAt}>{formatStoryDate(story.publishedAt)}</time>
            </p>
          </div>
        </StoryLink>
      ))}
    </aside>
  );
}
