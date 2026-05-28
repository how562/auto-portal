import {
  PLACEHOLDER_STORIES,
  type CavenderStory,
  type StoryCategory,
} from "@/lib/storiesContent";
import { getSupabase } from "@/lib/supabase";

type StoryRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover_image: string;
  cover_image_alt: string;
  author: string;
  published_at: string;
  read_time: string;
  featured: boolean;
  external_url: string | null;
  status: string;
  body: string[] | null;
};

function rowToStory(row: StoryRow): CavenderStory | null {
  const category = row.category as CavenderStory["category"];
  if (!["community", "vehicles", "people", "culture"].includes(category)) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category,
    coverImage: row.cover_image,
    coverImageAlt: row.cover_image_alt,
    author: row.author,
    publishedAt: row.published_at,
    readTime: row.read_time,
    featured: row.featured,
    externalUrl: row.external_url,
    status: row.status === "draft" ? "draft" : "published",
    body: Array.isArray(row.body) ? row.body : [],
  };
}

function sortStories(stories: CavenderStory[]): CavenderStory[] {
  return [...stories].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function fetchPublishedStories(): Promise<CavenderStory[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("cavender_stories")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error || !data?.length) {
      return sortStories(PLACEHOLDER_STORIES.filter((s) => s.status === "published"));
    }

    const mapped = data
      .map((row) => rowToStory(row as StoryRow))
      .filter((s): s is CavenderStory => s !== null);

    if (mapped.length === 0) {
      return sortStories(PLACEHOLDER_STORIES.filter((s) => s.status === "published"));
    }

    return sortStories(mapped);
  } catch {
    return sortStories(PLACEHOLDER_STORIES.filter((s) => s.status === "published"));
  }
}

export async function fetchStoryBySlug(slug: string): Promise<CavenderStory | null> {
  const stories = await fetchPublishedStories();
  return stories.find((s) => s.slug === slug) ?? null;
}

export function getFeaturedStory(stories: CavenderStory[]): CavenderStory {
  return stories.find((s) => s.featured) ?? stories[0];
}

export function getSidebarStories(
  stories: CavenderStory[],
  featured: CavenderStory,
  limit = 4,
): CavenderStory[] {
  return stories.filter((s) => s.id !== featured.id).slice(0, limit);
}

export function getLatestStories(
  stories: CavenderStory[],
  featured: CavenderStory,
  limit = 8,
): CavenderStory[] {
  return stories.filter((s) => s.id !== featured.id).slice(0, limit);
}

export function getStoriesByCategory(
  stories: CavenderStory[],
  category: StoryCategory,
  limit = 4,
): CavenderStory[] {
  return stories.filter((s) => s.category === category).slice(0, limit);
}
