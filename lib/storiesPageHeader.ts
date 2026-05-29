import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";
import { STORIES_PAGE_META } from "@/lib/storiesContent";

export interface StoriesIndexPageContent {
  header?: PageHeaderConfig;
}

export const STORIES_PAGE_HEADER: PageHeaderConfig = {
  type: "magazine",
  magazine: {
    logoUrl: "",
    logoText: "",
    eyebrow: "Editorial",
    title: STORIES_PAGE_META.title,
    subtitle: STORIES_PAGE_META.subtitle,
    categoryLinks: [
      { label: "Community", href: "/stories?category=community" },
      { label: "Vehicles", href: "/stories?category=vehicles" },
      { label: "People", href: "/stories?category=people" },
      { label: "Culture", href: "/stories?category=culture" },
    ],
    darkMode: true,
  },
};

export const STORIES_INDEX_PAGE_CONTENT: StoriesIndexPageContent = {
  header: STORIES_PAGE_HEADER,
};
