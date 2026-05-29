export type CommunityHeroImagePosition =
  | "top_left"
  | "right_tall"
  | "center_small"
  | "bottom_wide";

export const HERO_IMAGE_POSITIONS: CommunityHeroImagePosition[] = [
  "top_left",
  "right_tall",
  "center_small",
  "bottom_wide",
];

export interface CommunityHeroImageSlot {
  position: CommunityHeroImagePosition;
  url?: string;
  alt?: string;
}

export interface CommunityHeroButton {
  label: string;
  url: string;
  variant: "primary" | "secondary";
}

export interface CommunityHeroEyebrow {
  label: string;
  url: string;
}

export interface CommunityHeroHeadlineLine {
  text: string;
  muted: boolean;
}

import type { PageSection } from "./cmsTypes";

/** Homepage hero presentation — `current` keeps the editorial collage hero. */
export type HomepageHeroLayout = "current" | "video_fullscreen";

export type HomepageHeroOverlayColor = "dark" | "light";

export interface CommunityHeroVideoSettings {
  heroLayout: HomepageHeroLayout;
  videoUrl: string;
  posterImage: string;
  overlayColor: HomepageHeroOverlayColor;
  /** 0–1 */
  overlayOpacity: number;
  showInventorySearchBar: boolean;
}

export interface CommunityHeroContent {
  eyebrow: CommunityHeroEyebrow;
  headlineLines: CommunityHeroHeadlineLine[];
  subheadline: string;
  body: string;
  buttons: CommunityHeroButton[];
  images: CommunityHeroImageSlot[];
  video: CommunityHeroVideoSettings;
  /** Source section for locale-aware re-parse (homepage community_hero). */
  pageSection?: PageSection;
}
