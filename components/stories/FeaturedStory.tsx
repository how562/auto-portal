import { StoryLink } from "@/components/stories/StoryLink";
import type { CavenderStory } from "@/lib/storiesContent";
import { formatStoryDate, storyCategoryLabel } from "@/lib/storiesContent";

export function FeaturedStory({ story }: { story: CavenderStory }) {
  return (
    <StoryLink story={story} className="stories-featured">
      <div className="stories-featured__media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={story.coverImage} alt={story.coverImageAlt} />
      </div>
      <div className="stories-featured__body">
        <p className="stories-featured__category">{storyCategoryLabel(story.category)}</p>
        <h2 className="stories-featured__title">{story.title}</h2>
        <p className="stories-featured__excerpt">{story.excerpt}</p>
        <p className="stories-featured__meta">
          <span>{story.author}</span>
          <span aria-hidden>·</span>
          <time dateTime={story.publishedAt}>{formatStoryDate(story.publishedAt)}</time>
          <span aria-hidden>·</span>
          <span>{story.readTime}</span>
        </p>
        <span className="stories-featured__cta">Read Story</span>
      </div>
    </StoryLink>
  );
}
