import type { EnrichedCMSSection } from "./cmsSectionModel";
import type { CMSSectionType } from "./cmsTypes";

export const SHOWCASE_HERO_IMAGES = {
  community: "/hero/community.jpg",
  dealership: "/hero/dealership.jpg",
  lifestyle: "/hero/lifestyle.jpg",
  vehicle: "/hero/vehicle.jpg",
} as const;

export interface SectionShowcasePresetDef {
  variantLabel: string;
  section_type: CMSSectionType;
  /** Optional override of registry description */
  description?: string;
  fields: Partial<EnrichedCMSSection>;
}

/**
 * 44 premade CMS layout presets — one row per visual variant in the showcase.
 * Order matches sort_order spacing (×10) when materialized.
 */
export const SECTION_SHOWCASE_PRESET_DEFS: SectionShowcasePresetDef[] = [
  // Hero (6)
  {
    variantLabel: "Hero · Light with image",
    section_type: "hero",
    fields: {
      eyebrow: "Eyebrow",
      headline: "Hero · Light with image",
      subheadline: "Background image at reduced opacity behind copy.",
      settings: {
        variant: "light",
        cta_label: "Browse inventory",
        cta_href: "/inventory",
      },
      image_url: SHOWCASE_HERO_IMAGES.dealership,
    },
  },
  {
    variantLabel: "Hero · Light, copy only",
    section_type: "hero",
    fields: {
      headline: "Hero · Light, copy only",
      subheadline: "No image_url — text-only band.",
      settings: { variant: "light", cta_label: "Get started", cta_href: "/inventory" },
    },
  },
  {
    variantLabel: "Hero · Dark with image",
    section_type: "hero",
    fields: {
      eyebrow: "Featured",
      headline: "Hero · Dark with image",
      subheadline: "variant: dark in settings.",
      settings: {
        variant: "dark",
        cta_label: "Shop now",
        cta_href: "/inventory",
      },
      image_url: SHOWCASE_HERO_IMAGES.vehicle,
    },
  },
  {
    variantLabel: "Hero · Dark, copy only",
    section_type: "hero",
    fields: {
      headline: "Hero · Dark, copy only",
      subheadline: "Charcoal band without background image.",
      settings: { variant: "dark", cta_label: "Contact", cta_href: "/about-us" },
    },
  },
  {
    variantLabel: "Hero · Light + column CTA",
    section_type: "hero",
    fields: {
      headline: "Hero · Column CTA fields",
      subheadline: "Uses cta_text / cta_url columns instead of settings.",
      cta_text: "View inventory",
      cta_url: "/inventory",
      settings: { variant: "light" },
      image_url: SHOWCASE_HERO_IMAGES.lifestyle,
    },
  },
  {
    variantLabel: "Hero · Dark + eyebrow",
    section_type: "hero",
    fields: {
      eyebrow: "Cavender Auto Group",
      headline: "Hero · Dark + eyebrow",
      subheadline: "Eyebrow renders above headline.",
      settings: { variant: "dark", cta_label: "Learn more", cta_href: "/about-us" },
    },
  },

  // Text block (4)
  {
    variantLabel: "Text block · Left",
    section_type: "text_block",
    fields: {
      headline: "Text block · Left aligned",
      subheadline: "alignment: left",
      body: "Body copy supports multiple paragraphs.\n\nSecond paragraph separated by a blank line.",
      settings: { alignment: "left" },
    },
  },
  {
    variantLabel: "Text block · Center",
    section_type: "text_block",
    fields: {
      headline: "Text block · Center aligned",
      subheadline: "alignment: center",
      body: "Centered copy for short statements or pull quotes.",
      settings: { alignment: "center" },
    },
  },
  {
    variantLabel: "Text block · Long form",
    section_type: "text_block",
    fields: {
      headline: "Text block · Long form",
      body: "Extended body for policies or about copy.\n\nUse blank lines between paragraphs so spacing stays readable on the public site.\n\nA third paragraph demonstrates vertical rhythm.",
      settings: { alignment: "left" },
    },
  },
  {
    variantLabel: "Text block · Headline only",
    section_type: "text_block",
    fields: {
      headline: "Text block · Headline only",
      settings: { alignment: "center" },
    },
  },

  // Image + text (5)
  {
    variantLabel: "Image + text · Image right",
    section_type: "image_text",
    fields: {
      headline: "Image on the right",
      subheadline: "layout: image_right",
      body: "Readable body renders below the headline stack.",
      image_url: SHOWCASE_HERO_IMAGES.lifestyle,
      settings: { layout: "image_right", media_type: "image" },
    },
  },
  {
    variantLabel: "Image + text · Image left",
    section_type: "image_text",
    fields: {
      headline: "Image on the left",
      subheadline: "layout: image_left",
      body: "Media column orders before copy on md+ breakpoints.",
      image_url: SHOWCASE_HERO_IMAGES.community,
      settings: { layout: "image_left", media_type: "image" },
    },
  },
  {
    variantLabel: "Image + text · Copy only",
    section_type: "image_text",
    fields: {
      headline: "Image + text · No media",
      body: "When image_url is empty, the section collapses to a single column.",
      settings: { layout: "image_right", media_type: "image" },
    },
  },
  {
    variantLabel: "Image + text · Video placeholder",
    section_type: "image_text",
    fields: {
      headline: "Video placeholder",
      subheadline: "media_type: video",
      body: "Shows media frame without a poster image.",
      settings: {
        layout: "image_right",
        media_type: "video",
        video_title: "Walkaround video",
      },
    },
  },
  {
    variantLabel: "Image + text · Long body",
    section_type: "image_text",
    fields: {
      headline: "Split with long body",
      body: "First paragraph beside media.\n\nSecond paragraph continues the story with comfortable line length.",
      image_url: SHOWCASE_HERO_IMAGES.dealership,
      settings: { layout: "image_left", media_type: "image" },
    },
  },

  // Split feature (3)
  {
    variantLabel: "Split feature · Standard",
    section_type: "split_feature",
    fields: {
      headline: "Split feature · Standard",
      image_url: SHOWCASE_HERO_IMAGES.community,
      settings: {
        left_title: "Left column",
        left_body: "Feature copy in a cream card.",
        right_title: "Right column",
        right_body: "Second feature block beside the image.",
      },
    },
  },
  {
    variantLabel: "Split feature · Headline only",
    section_type: "split_feature",
    fields: {
      headline: "Split feature · Headline only",
      image_url: SHOWCASE_HERO_IMAGES.vehicle,
      settings: {},
    },
  },
  {
    variantLabel: "Split feature · Text columns",
    section_type: "split_feature",
    fields: {
      headline: "Split feature · Text columns",
      settings: {
        left_title: "Savings",
        left_body: "Transparent pricing on every vehicle.",
        right_title: "Service",
        right_body: "Factory-trained technicians at every store.",
      },
    },
  },

  // CTA band (4)
  {
    variantLabel: "CTA band · Dark, dual buttons",
    section_type: "cta_band",
    fields: {
      headline: "CTA band · Dark, dual buttons",
      subheadline: "settings.buttons array",
      settings: {
        variant: "dark",
        buttons: [
          { label: "Shop inventory", url: "/inventory" },
          { label: "Contact", url: "/about-us" },
        ],
      },
    },
  },
  {
    variantLabel: "CTA band · Dark, single CTA",
    section_type: "cta_band",
    fields: {
      headline: "CTA band · Dark, single CTA",
      settings: { variant: "dark", cta_label: "Browse inventory", cta_href: "/inventory" },
    },
  },
  {
    variantLabel: "CTA band · Light, dual buttons",
    section_type: "cta_band",
    fields: {
      headline: "CTA band · Light, dual buttons",
      subheadline: "variant: light",
      settings: {
        variant: "light",
        buttons: [
          { label: "Start discovery", url: "/#guided-discovery" },
          { label: "View inventory", url: "/inventory" },
        ],
      },
    },
  },
  {
    variantLabel: "CTA band · Light, single CTA",
    section_type: "cta_band",
    fields: {
      headline: "CTA band · Light, single CTA",
      settings: { variant: "light", cta_label: "Get started", cta_href: "/inventory" },
    },
  },

  // FAQ (2)
  {
    variantLabel: "FAQ · Two items",
    section_type: "faq",
    fields: {
      headline: "FAQ · Two items",
      settings: {
        items: [
          { question: "Where is body stored?", answer: "In the body column — not content." },
          { question: "Can I reorder sections?", answer: "Yes, via sort_order in admin." },
        ],
      },
    },
  },
  {
    variantLabel: "FAQ · Four items",
    section_type: "faq",
    fields: {
      headline: "FAQ · Four items",
      settings: {
        items: [
          { question: "Financing?", answer: "Work with our finance team in-store or online." },
          { question: "Trade-ins?", answer: "We accept trade-ins at every location." },
          { question: "Service?", answer: "Factory-trained technicians at each store." },
          { question: "Hours?", answer: "Varies by location — see the locations section." },
        ],
      },
    },
  },

  // Stats (3)
  {
    variantLabel: "Stats · Three columns",
    section_type: "stats",
    fields: {
      headline: "Stats · Three columns",
      settings: {
        items: [
          { label: "Vehicles", value: "2,400+" },
          { label: "Stores", value: "12" },
          { label: "Years", value: "80+" },
        ],
      },
    },
  },
  {
    variantLabel: "Stats · Four columns",
    section_type: "stats",
    fields: {
      headline: "Stats · Four columns",
      settings: {
        items: [
          { label: "New", value: "1,200" },
          { label: "Used", value: "1,200" },
          { label: "Brands", value: "15+" },
          { label: "Cities", value: "8" },
        ],
      },
    },
  },
  {
    variantLabel: "Stats · Two metrics",
    section_type: "stats",
    fields: {
      headline: "Stats · Two metrics",
      settings: {
        items: [
          { label: "Customer satisfaction", value: "98%" },
          { label: "Same-day appointments", value: "Yes" },
        ],
      },
    },
  },

  // Card grid (3)
  {
    variantLabel: "Card grid · Two cards",
    section_type: "card_grid",
    fields: {
      headline: "Card grid · Two cards",
      settings: {
        cards: [
          { title: "Integrity", body: "Honesty on every deal." },
          { title: "Commitment", body: "We follow through." },
        ],
      },
    },
  },
  {
    variantLabel: "Card grid · Three cards",
    section_type: "card_grid",
    fields: {
      headline: "Card grid · Three cards",
      subheadline: "Default demo layout",
      settings: {
        cards: [
          { title: "Integrity", body: "We win with honesty and transparency." },
          { title: "Commitment", body: "We follow through on every promise." },
          { title: "Community", body: "We give back to San Antonio." },
        ],
      },
    },
  },
  {
    variantLabel: "Card grid · Four cards",
    section_type: "card_grid",
    fields: {
      headline: "Card grid · Four cards",
      settings: {
        cards: [
          { title: "New", body: "Latest models in stock." },
          { title: "Used", body: "Certified pre-owned options." },
          { title: "Service", body: "Factory-trained techs." },
          { title: "Parts", body: "OEM parts department." },
        ],
      },
    },
  },

  // Inventory collection (3) — vehicles attached at materialize time
  {
    variantLabel: "Inventory collection · With vehicles",
    section_type: "inventory_collection",
    fields: {
      headline: "Featured inventory",
      subheadline: "Vehicle rail when collection resolves",
      settings: { limit: 8 },
    },
  },
  {
    variantLabel: "Inventory collection · Headline only",
    section_type: "inventory_collection",
    fields: {
      headline: "Inventory collection · Empty rail",
      settings: { limit: 8 },
    },
  },
  {
    variantLabel: "Inventory collection · Subhead",
    section_type: "inventory_collection",
    fields: {
      headline: "Shop featured models",
      subheadline: "Links to full inventory below the rail",
      settings: { limit: 6 },
    },
  },

  // Form (2)
  {
    variantLabel: "Form · General lead",
    section_type: "form",
    fields: {
      headline: "General lead form",
      subheadline: "form_type: general",
      settings: { form_type: "general" },
    },
  },
  {
    variantLabel: "Form · Headline only",
    section_type: "form",
    fields: {
      headline: "Form · Headline only",
      settings: { form_type: "general" },
    },
  },

  // Locations (2) — stores attached at materialize time
  {
    variantLabel: "Locations · Two stores",
    section_type: "locations",
    fields: {
      headline: "Our locations",
      subheadline: "Pulled from store records",
    },
  },
  {
    variantLabel: "Locations · Headline only",
    section_type: "locations",
    fields: {
      headline: "Visit a store near you",
    },
  },

  // Custom HTML (2)
  {
    variantLabel: "Custom HTML · Simple",
    section_type: "custom_html",
    fields: {
      headline: "Custom HTML · Simple",
      settings: {
        html: "<p>Sanitized HTML block with a <strong>bold</strong> phrase and a <a href=\"/inventory\">link</a>.</p>",
      },
    },
  },
  {
    variantLabel: "Custom HTML · Rich",
    section_type: "custom_html",
    fields: {
      headline: "Custom HTML · Rich",
      settings: {
        html: "<h3>Subheading in HTML</h3><p>Second paragraph with <em>emphasis</em>.</p><ul><li>Bullet one</li><li>Bullet two</li></ul>",
      },
    },
  },

  // Community hero (2) — generic renderer on public CMS pages
  {
    variantLabel: "Community hero · Generic fallback",
    section_type: "community_hero",
    description: "Homepage collage uses EditorialHero — CMS pages use generic fallback.",
    fields: {
      eyebrow: "Community",
      headline: "Community hero\nGeneric preview",
      body: "On the homepage this type maps to EditorialHero; here you see the CMS generic block.",
      image_url: SHOWCASE_HERO_IMAGES.community,
    },
  },
  {
    variantLabel: "Community hero · Copy only",
    section_type: "community_hero",
    fields: {
      headline: "Community hero · Copy only",
      body: "No collage in generic renderer — copy and optional single image_url.",
    },
  },

  // Top picks (1)
  {
    variantLabel: "Top picks · Generic fallback",
    section_type: "top_picks",
    description: "Homepage TopPicksSection is separate — generic fallback in CMS pages.",
    fields: {
      headline: "Top picks",
      subheadline: "Curated rail placeholder in CMS renderer",
    },
  },

  // Cavender commitment (2)
  {
    variantLabel: "Cavender commitment · With image",
    section_type: "cavender_commitment",
    description: "Homepage uses CavenderCommitmentSection — generic fallback here.",
    fields: {
      headline: "Cavender Commitment\nDriven by Impact.",
      body: "Generic CMS preview of the commitment band copy.",
      image_url: SHOWCASE_HERO_IMAGES.dealership,
    },
  },
  {
    variantLabel: "Cavender commitment · Copy only",
    section_type: "cavender_commitment",
    fields: {
      headline: "Cavender commitment",
      body: "Commitment copy without image in generic renderer.",
    },
  },
];
