import type { PageSectionSeedInput } from "@/lib/cmsAdmin";

export const CMS_DEMO_META_DESCRIPTION =
  "Internal demo page for all core CMS section types.";

/** Section seeds for the CMS demo workbench page (matches migration). */
export const CMS_DEMO_SECTION_SEEDS: PageSectionSeedInput[] = [
  {
    section_type: "hero",
    sort_order: 10,
    headline: "CMS Hero Demo",
    subheadline: "Subheadline for hero — canonical fields only.",
    settings: {
      variant: "light",
      cta_label: "Browse inventory",
      cta_href: "/inventory",
    },
  },
  {
    section_type: "text_block",
    sort_order: 20,
    headline: "Text block demo",
    subheadline: "Supporting subheadline",
    body: "First paragraph of body copy.\n\nSecond paragraph with a blank line between.",
    settings: { alignment: "left" },
  },
  {
    section_type: "image_text",
    sort_order: 30,
    headline: "Image + text demo",
    body: "Body copy lives in the body column.\n\nImage URL is optional — text still renders.",
    settings: { media_type: "image", layout: "image_right" },
  },
  {
    section_type: "cta_band",
    sort_order: 40,
    headline: "Ready to take the next step?",
    subheadline: "Choose an action below.",
    settings: {
      buttons: [
        { label: "Shop inventory", url: "/inventory" },
        { label: "Contact", url: "/about-us" },
      ],
    },
  },
  {
    section_type: "card_grid",
    sort_order: 50,
    headline: "Card grid demo",
    subheadline: "Cards are defined in settings.cards",
    settings: {
      cards: [
        { title: "Integrity", body: "We win with honesty and transparency." },
        { title: "Commitment", body: "We follow through on every promise." },
        { title: "Community", body: "We give back to San Antonio." },
      ],
    },
  },
  {
    section_type: "faq",
    sort_order: 60,
    headline: "FAQ demo",
    settings: {
      items: [
        {
          question: "Where is body stored?",
          answer: "In the body column — not content or title.",
        },
        {
          question: "What about Spanish?",
          answer: "Use headline_es, body_es, and related _es fields.",
        },
      ],
    },
  },
];
