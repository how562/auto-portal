import Link from "next/link";
import { PageHeaderRenderer } from "@/components/page-headers/PageHeaderRenderer";
import type { CavenderStory } from "@/lib/storiesContent";
import { formatStoryDate, storyCategoryLabel } from "@/lib/storiesContent";
import { resolvePageHeader } from "@/lib/pageHeaderResolve";
import { STORIES_INDEX_PAGE_CONTENT } from "@/lib/storiesPageHeader";
import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

import "@/app/stories-page.css";

export function StoryDetailView({ story }: { story: CavenderStory }) {
  const baseHeader = resolvePageHeader("stories", STORIES_INDEX_PAGE_CONTENT);
  let header: PageHeaderConfig | null = baseHeader;
  if (baseHeader?.type === "magazine") {
    header = {
      type: "magazine",
      magazine: {
        ...baseHeader.magazine,
        eyebrow: storyCategoryLabel(story.category),
        title: story.title,
        subtitle: story.excerpt,
      },
    };
  }

  return (
    <article className="stories-page stories-detail">
      <PageHeaderRenderer header={header} />
      <div className="portal-container">
        <Link href="/stories" className="stories-detail__back">
          ← All Stories
        </Link>

        <div className="stories-detail__hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={story.coverImage} alt={story.coverImageAlt} />
        </div>

        <p className="stories-detail__category">{storyCategoryLabel(story.category)}</p>
        <h1 className="stories-detail__title">{story.title}</h1>
        <p className="stories-detail__meta">
          {story.author}
          <span aria-hidden> · </span>
          <time dateTime={story.publishedAt}>{formatStoryDate(story.publishedAt)}</time>
          <span aria-hidden> · </span>
          {story.readTime}
        </p>

        <div className="stories-detail__body">
          {story.body.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </div>
      </div>
    </article>
  );
}
