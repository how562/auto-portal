export const STORY_CATEGORIES = [
  "community",
  "vehicles",
  "people",
  "culture",
] as const;

export type StoryCategory = (typeof STORY_CATEGORIES)[number];

export type StoryStatus = "draft" | "published";

export interface CavenderStory {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: StoryCategory;
  coverImage: string;
  coverImageAlt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  externalUrl: string | null;
  status: StoryStatus;
  body: string[];
}

export const STORY_CATEGORY_LABELS: Record<StoryCategory, string> = {
  community: "Community",
  vehicles: "Vehicles",
  people: "People",
  culture: "Culture",
};

export interface StoriesPageMeta {
  title: string;
  subtitle: string;
}

export const STORIES_PAGE_META: StoriesPageMeta = {
  title: "Stories",
  subtitle: "People, places, vehicles, and moments from across Cavender Auto Group.",
};

const IMG = {
  community: "/images/hero/community.jpg",
  dealership: "/images/hero/dealership.jpg",
  lifestyle: "/images/hero/lifestyle.jpg",
  vehicle: "/images/hero/vehicle.jpg",
} as const;

export const PLACEHOLDER_STORIES: CavenderStory[] = [
  {
    id: "commitment-honoring-service",
    slug: "cavender-commitment-honoring-those-who-serve",
    title: "Cavender Commitment: Honoring Those Who Serve",
    excerpt:
      "How Cavender Auto Group supports veterans and active-duty military with a lifetime oil change promise — and why it matters.",
    category: "community",
    coverImage: IMG.community,
    coverImageAlt: "Military appreciation at Cavender",
    author: "Cavender Editorial",
    publishedAt: "2026-03-15T12:00:00.000Z",
    readTime: "6 min read",
    featured: true,
    externalUrl: null,
    status: "published",
    body: [
      "For Cavender Auto Group, honoring those who serve is more than a program — it is a reflection of the values the Cavender family has carried for generations.",
      "The Cavender Commitment offers eligible veterans and active-duty service members complimentary oil changes for life at participating locations — a tangible way to say thank you.",
    ],
  },
  {
    id: "cavender-cares-community",
    slug: "cavender-cares-in-the-community",
    title: "Cavender Cares in the Community",
    excerpt:
      "A look at partnerships, volunteer hours, and the organizations Cavender Cares supports across Texas.",
    category: "community",
    coverImage: IMG.community,
    coverImageAlt: "Cavender Cares community event",
    author: "Cavender Editorial",
    publishedAt: "2026-03-08T12:00:00.000Z",
    readTime: "5 min read",
    featured: false,
    externalUrl: "/cavender-cares",
    status: "published",
    body: [
      "Since 2021, Cavender Cares has focused philanthropy where it matters most — military support, education, health and wellness, and community culture.",
    ],
  },
  {
    id: "meet-the-people",
    slug: "meet-the-people-behind-cavender",
    title: "Meet the People Behind Cavender",
    excerpt:
      "The teammates, leaders, and ambassadors who bring the Cavender experience to life every day.",
    category: "people",
    coverImage: IMG.lifestyle,
    coverImageAlt: "Cavender team members",
    author: "Cavender Editorial",
    publishedAt: "2026-02-28T12:00:00.000Z",
    readTime: "4 min read",
    featured: false,
    externalUrl: null,
    status: "published",
    body: [
      "Behind every dealership is a team committed to customers, community, and each other.",
    ],
  },
  {
    id: "right-vehicle",
    slug: "finding-the-right-vehicle-for-your-life",
    title: "Finding the Right Vehicle for Your Life",
    excerpt:
      "Practical guidance for choosing a vehicle that fits how you live, work, and travel across Texas.",
    category: "vehicles",
    coverImage: IMG.vehicle,
    coverImageAlt: "Vehicle lineup",
    author: "Cavender Editorial",
    publishedAt: "2026-02-20T12:00:00.000Z",
    readTime: "7 min read",
    featured: false,
    externalUrl: null,
    status: "published",
    body: [
      "The right vehicle is the one that matches your daily rhythm — not just the spec sheet.",
    ],
  },
  {
    id: "serving-texas-1939",
    slug: "serving-texas-since-1939",
    title: "Serving Texas Since 1939",
    excerpt:
      "Milestones from eight decades of family ownership, growth, and community investment.",
    category: "culture",
    coverImage: IMG.dealership,
    coverImageAlt: "Cavender dealership heritage",
    author: "Cavender Editorial",
    publishedAt: "2026-02-10T12:00:00.000Z",
    readTime: "8 min read",
    featured: false,
    externalUrl: "/our-story",
    status: "published",
    body: [
      "The Cavender story began with relationships — and that foundation still guides us today.",
    ],
  },
  {
    id: "behind-the-scenes",
    slug: "behind-the-scenes-at-cavender-auto-group",
    title: "Behind the Scenes at Cavender Auto Group",
    excerpt:
      "What it takes to deliver a consistent experience across brands, locations, and communities.",
    category: "culture",
    coverImage: IMG.dealership,
    coverImageAlt: "Dealership operations",
    author: "Cavender Editorial",
    publishedAt: "2026-01-30T12:00:00.000Z",
    readTime: "5 min read",
    featured: false,
    externalUrl: null,
    status: "published",
    body: [
      "From service lanes to showrooms, every detail is shaped by people who care about getting it right.",
    ],
  },
  {
    id: "leadership-listening",
    slug: "leadership-starts-with-listening",
    title: "Leadership Starts With Listening",
    excerpt:
      "Why Rob and Lee Cavender created a direct line for customer feedback — and what they hear.",
    category: "people",
    coverImage: IMG.lifestyle,
    coverImageAlt: "Cavender leadership",
    author: "Cavender Editorial",
    publishedAt: "2026-01-22T12:00:00.000Z",
    readTime: "4 min read",
    featured: false,
    externalUrl: "/contact-the-cavenders",
    status: "published",
    body: [
      "Great leadership begins with openness — and a willingness to act on what customers share.",
    ],
  },
  {
    id: "weekend-drive",
    slug: "a-weekend-drive-through-texas",
    title: "A Weekend Drive Through Texas",
    excerpt:
      "Scenic routes, family stops, and the vehicles that make the journey memorable.",
    category: "vehicles",
    coverImage: IMG.vehicle,
    coverImageAlt: "Driving in Texas",
    author: "Cavender Editorial",
    publishedAt: "2026-01-15T12:00:00.000Z",
    readTime: "6 min read",
    featured: false,
    externalUrl: null,
    status: "published",
    body: [
      "Texas is built for the road — and the right vehicle turns miles into memories.",
    ],
  },
];

export function storyCategoryLabel(category: StoryCategory): string {
  return STORY_CATEGORY_LABELS[category];
}

export function formatStoryDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function storyHref(story: CavenderStory): string {
  if (story.externalUrl?.trim()) return story.externalUrl.trim();
  return `/stories/${story.slug}`;
}
