import type { CMSSectionType } from "./cmsTypes";
import type { HomepageLayoutSectionId } from "./homepageLayoutRegistry";

export type HomepageSectionEditorKind =
  | "hero"
  | "commitment"
  | "social_feed"
  | "none";

export interface HomepageSectionEditorMeta {
  layoutSectionId: HomepageLayoutSectionId;
  /** `page_sections.section_type` on site_pages.slug = home */
  cmsSectionType: CMSSectionType | null;
  dataSource: string;
  editable: boolean;
  editorKind: HomepageSectionEditorKind;
  notEditableReason?: string;
}

export const HOMEPAGE_SECTION_EDITOR_META: Record<
  HomepageLayoutSectionId,
  HomepageSectionEditorMeta
> = {
  editorial_hero: {
    layoutSectionId: "editorial_hero",
    cmsSectionType: "community_hero",
    dataSource: "page_sections (home → community_hero)",
    editable: true,
    editorKind: "hero",
  },
  discovery_categories: {
    layoutSectionId: "discovery_categories",
    cmsSectionType: null,
    dataSource: "lib/lifeFilters.ts (code)",
    editable: false,
    editorKind: "none",
    notEditableReason:
      "Life-stage cards are defined in code. A CMS editor for this section is not wired yet.",
  },
  driven_offers: {
    layoutSectionId: "driven_offers",
    cmsSectionType: null,
    dataSource: "lib/drivenOffers.ts (code)",
    editable: false,
    editorKind: "none",
    notEditableReason:
      "Offer cards are defined in code. A CMS editor for this section is not wired yet.",
  },
  guided_discovery: {
    layoutSectionId: "guided_discovery",
    cmsSectionType: null,
    dataSource: "GuidedDiscoverySection + inventory (code)",
    editable: false,
    editorKind: "none",
    notEditableReason:
      "Smart-match chips use portal copy and live inventory. A dedicated editor is not wired yet.",
  },
  cavender_commitment: {
    layoutSectionId: "cavender_commitment",
    cmsSectionType: "cavender_commitment",
    dataSource: "page_sections (home → cavender_commitment)",
    editable: true,
    editorKind: "commitment",
  },
  social_feed: {
    layoutSectionId: "social_feed",
    cmsSectionType: "social_feed",
    dataSource: "page_sections (home → social_feed)",
    editable: true,
    editorKind: "social_feed",
  },
  homepage_bottom_scene: {
    layoutSectionId: "homepage_bottom_scene",
    cmsSectionType: null,
    dataSource: "CSS / HomepageBottomScene (static)",
    editable: false,
    editorKind: "none",
    notEditableReason: "Decorative scene layer has no CMS content fields.",
  },
  explore_brands: {
    layoutSectionId: "explore_brands",
    cmsSectionType: null,
    dataSource: "lib/exploreBrands.ts (code)",
    editable: false,
    editorKind: "none",
    notEditableReason:
      "Brand marquee logos are defined in code. A CMS editor for this section is not wired yet.",
  },
  portal_footer: {
    layoutSectionId: "portal_footer",
    cmsSectionType: null,
    dataSource: "PortalFooter + portal_text_settings / managed_links",
    editable: false,
    editorKind: "none",
    notEditableReason:
      "Footer links and copy are managed under Navigation and Text Settings.",
  },
};

export function getHomepageSectionEditorMeta(
  layoutSectionId: HomepageLayoutSectionId,
): HomepageSectionEditorMeta {
  return HOMEPAGE_SECTION_EDITOR_META[layoutSectionId];
}
