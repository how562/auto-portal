import type { PageSection } from "./cmsTypes";
import type { SocialPlatform } from "./socialFeedPlaceholder";

/** Editable backup post stored in CMS (home page social_feed section). */
export interface SocialFeedBackupPost {
  id: string;
  platform: SocialPlatform;
  image_url: string;
  caption: string;
  date_label: string;
  href: string;
  page_name: string;
  is_active: boolean;
  sort_order: number;
}

export interface SocialFeedSectionCopy {
  eyebrow: string;
  headline: string;
  description: string;
}

export interface SocialFeedCmsContent extends SocialFeedSectionCopy {
  posts: SocialFeedBackupPost[];
}

export interface SocialFeedCmsPayload {
  pageSection: PageSection | null;
  content: SocialFeedCmsContent;
}

export interface SocialFeedAdminPayload {
  sectionId: string | null;
  pageId: string | null;
  content: SocialFeedCmsContent;
  liveModeEnabled: boolean;
}
