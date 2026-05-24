import type {
  CommunityHeroContent,
  CommunityHeroImagePosition,
  CommunityHeroImageSlot,
} from "./communityHeroTypes";
import { HERO_IMAGE_POSITIONS } from "./communityHeroTypes";

export const HERO_DEFAULT_IMAGES: Record<
  CommunityHeroImagePosition,
  { url: string; alt: string }
> = {
  top_left: { url: "/images/hero/community.png", alt: "Community" },
  right_tall: { url: "/images/hero/dealership.png", alt: "Dealership" },
  center_small: { url: "/images/hero/vehicle.png", alt: "Vehicle" },
  bottom_wide: { url: "/images/hero/lifestyle.png", alt: "Lifestyle" },
};

export function resolveHeroImageSlots(
  slots: CommunityHeroImageSlot[],
): CommunityHeroImageSlot[] {
  return HERO_IMAGE_POSITIONS.map((position) => {
    const slot = slots.find((s) => s.position === position);
    const defaults = HERO_DEFAULT_IMAGES[position];
    return {
      position,
      url: slot?.url?.trim() || defaults.url,
      alt: slot?.alt?.trim() || defaults.alt,
    };
  });
}

/** Default hero when no published home / community_hero section exists in CMS. */
export const COMMUNITY_HERO_FALLBACK: CommunityHeroContent = {
  eyebrow: {
    label: "",
    url: "",
  },
  headlineLines: [
    { text: "Cavender Confidence.", muted: false },
    { text: "Driven by Impact.", muted: true },
  ],
  subheadline: "",
  body: "At Cavender Auto Group, every vehicle we sell supports the people and causes that make our communities stronger. Together, we’re driving more than change — we’re building a better tomorrow.",
  buttons: [
    { label: "Start Your Journey", url: "#guided-discovery", variant: "primary" },
    { label: "Browse Inventory", url: "/inventory", variant: "secondary" },
  ],
  images: resolveHeroImageSlots([]),
};
