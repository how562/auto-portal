/**
 * Canonical homepage sections rendered by PortalExperience (excludes fixed header/spacer).
 */

export type HomepageLayoutSectionId =
  | "editorial_hero"
  | "discovery_categories"
  | "driven_offers"
  | "guided_discovery"
  | "cavender_commitment"
  | "social_feed"
  | "homepage_bottom_scene"
  | "explore_brands"
  | "portal_footer";

export type HomepageLayoutZone = "main" | "lower";

export interface HomepageLayoutSectionDef {
  id: HomepageLayoutSectionId;
  label: string;
  description: string;
  zone: HomepageLayoutZone;
  /** Cannot be hidden or moved (footer stays last when locked). */
  locked?: boolean;
  previewVariant:
    | "hero"
    | "life-grid"
    | "offers"
    | "guided"
    | "commitment"
    | "social"
    | "brands"
    | "scene"
    | "footer";
}

export const HOMEPAGE_LAYOUT_SECTION_DEFS: HomepageLayoutSectionDef[] = [
  {
    id: "editorial_hero",
    label: "Hero",
    description:
      "Editorial collage or fullscreen video hero (CMS: Hero layout), plus inventory search bridge.",
    zone: "main",
    previewVariant: "hero",
  },
  {
    id: "discovery_categories",
    label: "Shop by Life",
    description: "Life-stage category cards that route shoppers into inventory.",
    zone: "main",
    previewVariant: "life-grid",
  },
  {
    id: "driven_offers",
    label: "Driven Offers",
    description: "Editorial sales and service offer cards with view-all link.",
    zone: "main",
    previewVariant: "offers",
  },
  {
    id: "guided_discovery",
    label: "Refine your fit",
    description: "Guided discovery chips and smart-match vehicle previews.",
    zone: "lower",
    previewVariant: "guided",
  },
  {
    id: "cavender_commitment",
    label: "Cavender Commitment",
    description: "Honoring those who serve — imagery and commitment CTAs.",
    zone: "lower",
    previewVariant: "commitment",
  },
  {
    id: "social_feed",
    label: "Around the Cavender Family",
    description: "Social feed carousel and follow CTA.",
    zone: "lower",
    previewVariant: "social",
  },
  {
    id: "homepage_bottom_scene",
    label: "Bottom atmosphere",
    description: "Blueprint and drift-line texture above the brand strip.",
    zone: "lower",
    previewVariant: "scene",
  },
  {
    id: "explore_brands",
    label: "Explore our brands",
    description: "Marquee of OEM logos across the dealership family.",
    zone: "lower",
    previewVariant: "brands",
  },
  {
    id: "portal_footer",
    label: "Footer",
    description: "Site footer navigation, contact, and legal links.",
    zone: "lower",
    locked: true,
    previewVariant: "footer",
  },
];

export const HOMEPAGE_LAYOUT_DEFAULT_ORDER: HomepageLayoutSectionId[] =
  HOMEPAGE_LAYOUT_SECTION_DEFS.map((s) => s.id);

const DEF_BY_ID = new Map(
  HOMEPAGE_LAYOUT_SECTION_DEFS.map((d) => [d.id, d]),
);

export function getHomepageLayoutSectionDef(
  id: string,
): HomepageLayoutSectionDef | undefined {
  return DEF_BY_ID.get(id as HomepageLayoutSectionId);
}

export function isHomepageLayoutSectionId(
  id: string,
): id is HomepageLayoutSectionId {
  return DEF_BY_ID.has(id as HomepageLayoutSectionId);
}
