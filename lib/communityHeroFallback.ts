import type { CommunityHeroContent } from "./communityHeroTypes";

/** Default hero when no published home / community_hero section exists in CMS. */
export const COMMUNITY_HERO_FALLBACK: CommunityHeroContent = {
  eyebrow: {
    label: "Cavender Commitment",
    url: "/cavender-commitment",
  },
  headlineLines: [
    { text: "People First.", muted: false },
    { text: "Community Driven.", muted: false },
    { text: "Cars That Give Back.", muted: true },
  ],
  subheadline: "",
  body: "At Cavender Auto Group, every vehicle we sell supports the people and causes that make our communities stronger. Together, we’re driving more than change — we’re building a better tomorrow.",
  buttons: [
    { label: "Start Your Journey", url: "#guided-discovery", variant: "primary" },
    { label: "Browse Inventory", url: "/inventory", variant: "secondary" },
  ],
  images: [
    { position: "top_left" },
    { position: "right_tall" },
    { position: "center_small" },
    { position: "bottom_wide" },
  ],
};
