import { StoryLink } from "@/components/stories/StoryLink";
import type { CavenderStory } from "@/lib/storiesContent";
import { formatStoryDate, storyCategoryLabel } from "@/lib/storiesContent";

export function StoryCard({
  story,
  showExcerpt = true,
}: {
  story: CavenderStory;
  showExcerpt?: boolean;
}) {
  return (
    <StoryLink story={story} className="stories-card">
      <div className="stories-card__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={story.coverImage} alt={story.coverImageAlt} />
      </div>
      <div className="stories-card__body">
        <p className="stories-card__category">{storyCategoryLabel(story.category)}</p>
        <h3 className="stories-card__title">{story.title}</h3>
        {showExcerpt ? <p className="stories-card__excerpt">{story.excerpt}</p> : null}
        <p className="stories-card__meta">
          <time dateTime={story.publishedAt}>{formatStoryDate(story.publishedAt)}</time>
          <span aria-hidden> · </span>
          {story.readTime}
        </p>
      </div>
    </StoryLink>
  );
}
