import { FeaturedStory } from "@/components/stories/FeaturedStory";
import { StoriesMasthead } from "@/components/stories/StoriesMasthead";
import { StoryCard } from "@/components/stories/StoryCard";
import { StoryCategorySection } from "@/components/stories/StoryCategorySection";
import { StorySidebar } from "@/components/stories/StorySidebar";
import { STORIES_PAGE_META, STORY_CATEGORIES } from "@/lib/storiesContent";
import type { CavenderStory } from "@/lib/storiesContent";
import {
  getFeaturedStory,
  getLatestStories,
  getSidebarStories,
  getStoriesByCategory,
} from "@/lib/storiesRepository";

import "@/app/stories-page.css";

interface StoriesPageViewProps {
  stories: CavenderStory[];
}

export function StoriesPageView({ stories }: StoriesPageViewProps) {
  const featured = getFeaturedStory(stories);
  const sidebar = getSidebarStories(stories, featured, 4);
  const latest = getLatestStories(stories, featured, 8);

  return (
    <div className="stories-page">
      <StoriesMasthead meta={STORIES_PAGE_META} />

      <div className="stories-featured-block">
        <div className="portal-container stories-featured-block__grid">
          <FeaturedStory story={featured} />
          <StorySidebar stories={sidebar} />
        </div>
      </div>

      <section className="stories-section" aria-labelledby="stories-latest-heading">
        <div className="portal-container">
          <h2 id="stories-latest-heading" className="stories-section__heading">
            Latest Stories
          </h2>
          <div className="stories-grid stories-grid--4">
            {latest.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </div>
      </section>

      {STORY_CATEGORIES.map((category) => (
        <StoryCategorySection
          key={category}
          category={category}
          stories={getStoriesByCategory(stories, category, 4)}
        />
      ))}
    </div>
  );
}
