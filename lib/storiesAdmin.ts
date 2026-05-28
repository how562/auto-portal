import {
  STORY_CATEGORIES,
  type CavenderStory,
  type StoryCategory,
  type StoryStatus,
} from "@/lib/storiesContent";
import { slugifyCollectionName } from "@/lib/collectionsAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export { slugifyCollectionName as slugifyStoryTitle };

const STORY_SELECT =
  "id, slug, title, excerpt, category, cover_image, cover_image_alt, author, published_at, read_time, featured, external_url, status, body, created_at, updated_at";

export type StoryAdminRow = CavenderStory & {
  createdAt: string;
  updatedAt: string;
};

export interface StoryCreateInput {
  title: string;
  slug?: string;
  excerpt?: string;
  category?: StoryCategory;
  cover_image?: string;
  cover_image_alt?: string;
  author?: string;
  published_at?: string;
  read_time?: string;
  featured?: boolean;
  external_url?: string | null;
  status?: StoryStatus;
  body?: string[];
}

export interface StoryUpdateInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  category?: StoryCategory;
  cover_image?: string;
  cover_image_alt?: string;
  author?: string;
  published_at?: string;
  read_time?: string;
  featured?: boolean;
  external_url?: string | null;
  status?: StoryStatus;
  body?: string[];
}

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
  created_at: string;
  updated_at: string;
};

function parseBody(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean);
}

function normalizeCategory(value: string): StoryCategory | null {
  if ((STORY_CATEGORIES as readonly string[]).includes(value)) {
    return value as StoryCategory;
  }
  return null;
}

function rowToAdminStory(row: StoryRow): StoryAdminRow | null {
  const category = normalizeCategory(row.category);
  if (!category) return null;

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
    body: parseBody(row.body),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatStoriesDbError(action: string, message: string): string {
  if (/relation.*cavender_stories does not exist/i.test(message)) {
    return `Failed to ${action} stories: run migration supabase/migrations/20260528120000_cavender_stories.sql.`;
  }
  return `Failed to ${action} stor${action === "load" ? "ies" : "y"}: ${message}`;
}

async function clearOtherFeaturedStories(excludeId?: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  let builder = supabase.from("cavender_stories").update({ featured: false });
  if (excludeId) builder = builder.neq("id", excludeId);
  const { error } = await builder.eq("featured", true);
  if (error) throw new Error(error.message);
}

export async function listStoriesAdmin(): Promise<StoryAdminRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cavender_stories")
    .select(STORY_SELECT)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(formatStoriesDbError("load", error.message));
  }

  return (data ?? [])
    .map((row) => rowToAdminStory(row as StoryRow))
    .filter((row): row is StoryAdminRow => row != null);
}

export async function getStoryAdmin(id: string): Promise<StoryAdminRow | null> {
  const storyId = id.trim();
  if (!storyId) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cavender_stories")
    .select(STORY_SELECT)
    .eq("id", storyId)
    .maybeSingle();

  if (error) {
    throw new Error(formatStoriesDbError("load", error.message));
  }
  if (!data) return null;

  return rowToAdminStory(data as StoryRow);
}

export async function createStory(input: StoryCreateInput): Promise<StoryAdminRow> {
  const title = input.title?.trim();
  if (!title) throw new Error("title is required");

  const slug =
    (input.slug?.trim() || slugifyCollectionName(title)) || "story";
  const category = input.category ?? "community";
  if (!normalizeCategory(category)) {
    throw new Error("invalid category");
  }

  const featured = input.featured === true;
  if (featured) await clearOtherFeaturedStories();

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("cavender_stories")
    .insert({
      slug,
      title,
      excerpt: input.excerpt?.trim() ?? "",
      category,
      cover_image: input.cover_image?.trim() ?? "",
      cover_image_alt: input.cover_image_alt?.trim() ?? "",
      author: input.author?.trim() || "Cavender Editorial",
      published_at: input.published_at ?? now,
      read_time: input.read_time?.trim() || "5 min read",
      featured,
      external_url: input.external_url?.trim() || null,
      status: input.status === "published" ? "published" : "draft",
      body: input.body ?? [],
      updated_at: now,
    })
    .select(STORY_SELECT)
    .single();

  if (error) {
    throw new Error(formatStoriesDbError("create", error.message));
  }

  const row = rowToAdminStory(data as StoryRow);
  if (!row) throw new Error("Created story could not be read");
  return row;
}

export async function updateStory(
  id: string,
  input: StoryUpdateInput,
): Promise<StoryAdminRow> {
  const storyId = id.trim();
  if (!storyId) throw new Error("id is required");

  if (input.featured === true) {
    await clearOtherFeaturedStories(storyId);
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) throw new Error("title cannot be empty");
    payload.title = title;
  }
  if (input.slug !== undefined) {
    const slug = input.slug.trim();
    if (!slug) throw new Error("slug cannot be empty");
    payload.slug = slug;
  }
  if (input.excerpt !== undefined) payload.excerpt = input.excerpt.trim();
  if (input.category !== undefined) {
    if (!normalizeCategory(input.category)) throw new Error("invalid category");
    payload.category = input.category;
  }
  if (input.cover_image !== undefined) payload.cover_image = input.cover_image.trim();
  if (input.cover_image_alt !== undefined) {
    payload.cover_image_alt = input.cover_image_alt.trim();
  }
  if (input.author !== undefined) payload.author = input.author.trim();
  if (input.published_at !== undefined) payload.published_at = input.published_at;
  if (input.read_time !== undefined) payload.read_time = input.read_time.trim();
  if (input.featured !== undefined) payload.featured = input.featured;
  if (input.external_url !== undefined) {
    payload.external_url = input.external_url?.trim() || null;
  }
  if (input.status !== undefined) {
    payload.status = input.status === "published" ? "published" : "draft";
  }
  if (input.body !== undefined) payload.body = input.body;

  const supabase = getSupabaseAdmin();
  if (Object.keys(payload).length > 1) {
    const { error } = await supabase
      .from("cavender_stories")
      .update(payload)
      .eq("id", storyId);
    if (error) throw new Error(formatStoriesDbError("update", error.message));
  }

  const row = await getStoryAdmin(storyId);
  if (!row) throw new Error("Updated story could not be read");
  return row;
}

export async function deleteStory(id: string): Promise<void> {
  const storyId = id.trim();
  if (!storyId) throw new Error("id is required");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("cavender_stories").delete().eq("id", storyId);
  if (error) throw new Error(formatStoriesDbError("delete", error.message));
}

/** Seed DB from built-in placeholders (skips slugs that already exist). */
export async function seedStoriesFromPlaceholders(
  stories: CavenderStory[],
): Promise<{ inserted: number; skipped: number }> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase.from("cavender_stories").select("slug");
  const existingSlugs = new Set((existing ?? []).map((r) => r.slug as string));

  let inserted = 0;
  let skipped = 0;

  const { data: featuredRow } = await supabase
    .from("cavender_stories")
    .select("id")
    .eq("featured", true)
    .limit(1);
  let featuredSet = Boolean(featuredRow?.length);

  for (const story of stories) {
    if (existingSlugs.has(story.slug)) {
      skipped += 1;
      continue;
    }

    const featured = story.featured && !featuredSet;
    if (featured) featuredSet = true;

    const { error } = await supabase.from("cavender_stories").insert({
      slug: story.slug,
      title: story.title,
      excerpt: story.excerpt,
      category: story.category,
      cover_image: story.coverImage,
      cover_image_alt: story.coverImageAlt,
      author: story.author,
      published_at: story.publishedAt,
      read_time: story.readTime,
      featured,
      external_url: story.externalUrl,
      status: story.status,
      body: story.body,
      updated_at: new Date().toISOString(),
    });

    if (error) throw new Error(formatStoriesDbError("seed", error.message));
    inserted += 1;
  }

  return { inserted, skipped };
}

export function bodyParagraphsToText(body: string[]): string {
  return body.join("\n\n");
}

export function textToBodyParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
