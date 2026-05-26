import type { CMSSectionType } from "./cmsTypes";

export const PAGE_TEMPLATE_IDS = [
  "landing",
  "about",
  "community",
  "service",
  "finance",
  "campaign",
  "schedule_service",
  "cavender_commitment",
] as const;

export type PageTemplateId = (typeof PAGE_TEMPLATE_IDS)[number];

export interface PageTemplateSectionSeed {
  section_type: CMSSectionType;
  sort_order: number;
  is_active?: boolean;
  headline?: string | null;
  subheadline?: string | null;
  body?: string | null;
  image_url?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
  settings?: Record<string, unknown>;
}

export interface PageTemplateDefinition {
  id: PageTemplateId;
  label: string;
  description: string;
  suggestedSlug: string;
  sections: PageTemplateSectionSeed[];
}

export const PAGE_TEMPLATES: PageTemplateDefinition[] = [
  {
    id: "landing",
    label: "Landing Page",
    description: "Hero, proof points, featured inventory, and a closing CTA.",
    suggestedSlug: "landing",
    sections: [
      {
        section_type: "hero",
        sort_order: 10,
        headline: "Drive home your next vehicle",
        subheadline: "Browse inventory, schedule service, and connect with Cavender stores.",
        cta_text: "Shop inventory",
        cta_url: "/inventory",
        settings: { variant: "dark" },
      },
      {
        section_type: "stats",
        sort_order: 20,
        headline: "Why Cavender",
        settings: {
          items: [
            { value: "50+", label: "Years serving Texas" },
            { value: "8", label: "Dealership locations" },
            { value: "24/7", label: "Online shopping tools" },
          ],
        },
      },
      {
        section_type: "card_grid",
        sort_order: 30,
        headline: "Explore our brands",
        subheadline: "New and pre-owned vehicles across our family of stores.",
        settings: { cards: [] },
      },
      {
        section_type: "inventory_collection",
        sort_order: 40,
        headline: "Featured inventory",
        settings: { limit: 8 },
      },
      {
        section_type: "cta_band",
        sort_order: 50,
        headline: "Ready to get started?",
        subheadline: "Contact a store or start your purchase online.",
        settings: {
          buttons: [
            { label: "Contact us", url: "/about-us" },
            { label: "Shop inventory", url: "/inventory" },
          ],
        },
      },
    ],
  },
  {
    id: "about",
    label: "About Page",
    description: "Brand story, imagery, milestones, and contact CTA.",
    suggestedSlug: "about-us",
    sections: [
      {
        section_type: "text_block",
        sort_order: 10,
        headline: "About page",
        body: "The /about-us route uses the dedicated About Us layout. Edit lib/aboutUsPageContent.ts for copy and imagery.",
        settings: { alignment: "left" },
      },
    ],
  },
  {
    id: "community",
    label: "Community Page",
    description: "Community hero collage, stories, cards, and engagement CTA.",
    suggestedSlug: "community",
    sections: [
      {
        section_type: "community_hero",
        sort_order: 10,
        headline: "Cavender in the community",
        body: "Celebrating the people and places we serve across Texas.",
        settings: { images: [] },
      },
      {
        section_type: "text_block",
        sort_order: 20,
        headline: "Giving back",
        body: "Share sponsorships, events, and local partnerships.",
      },
      {
        section_type: "card_grid",
        sort_order: 30,
        headline: "Recent highlights",
        settings: { cards: [] },
      },
      {
        section_type: "cta_band",
        sort_order: 40,
        headline: "Partner with Cavender",
        settings: {
          buttons: [{ label: "Contact our team", url: "/about-us" }],
        },
      },
    ],
  },
  {
    id: "service",
    label: "Service Page",
    description: "Service overview, offerings grid, lead form, and locations.",
    suggestedSlug: "service",
    sections: [
      {
        section_type: "hero",
        sort_order: 10,
        headline: "Expert service you can trust",
        subheadline: "Factory-trained technicians and genuine parts at every Cavender store.",
        cta_text: "Schedule service",
        cta_url: "/schedule-service",
      },
      {
        section_type: "text_block",
        sort_order: 20,
        headline: "Service departments",
        body: "Describe maintenance, repairs, express lane, and OEM certifications.",
      },
      {
        section_type: "card_grid",
        sort_order: 30,
        headline: "Popular services",
        settings: {
          cards: [
            { title: "Oil change", description: "Quick, manufacturer-recommended service." },
            { title: "Brakes", description: "Inspections and repairs for safe stopping." },
            { title: "Tires", description: "Rotation, balance, and replacement options." },
          ],
        },
      },
      {
        section_type: "form",
        sort_order: 40,
        headline: "Request service",
        settings: { form_type: "service" },
      },
      {
        section_type: "locations",
        sort_order: 50,
        headline: "Service locations",
        subheadline: "Find hours and contact info for your nearest store.",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance Page",
    description: "Financing hero, overview, FAQ, application form, and CTA.",
    suggestedSlug: "finance",
    sections: [
      {
        section_type: "hero",
        sort_order: 10,
        headline: "Financing made simple",
        subheadline: "Competitive rates and flexible terms from Cavender finance teams.",
        cta_text: "Apply now",
        cta_url: "#apply",
      },
      {
        section_type: "text_block",
        sort_order: 20,
        headline: "How financing works",
        body: "Explain credit applications, trade-ins, and working with our finance managers.",
      },
      {
        section_type: "faq",
        sort_order: 30,
        headline: "Common questions",
        settings: {
          items: [
            {
              question: "What do I need to apply?",
              answer: "A valid ID, proof of income, and your preferred vehicle details.",
            },
            {
              question: "Can I get pre-approved?",
              answer: "Yes — start an application online or visit any Cavender store.",
            },
          ],
        },
      },
      {
        section_type: "form",
        sort_order: 40,
        headline: "Start your application",
        settings: { form_type: "finance" },
      },
      {
        section_type: "cta_band",
        sort_order: 50,
        headline: "Questions about financing?",
        settings: {
          buttons: [{ label: "Contact a store", url: "/about-us" }],
        },
      },
    ],
  },
  {
    id: "campaign",
    label: "Campaign Page",
    description: "Promotional landing with offer copy, CTA band, and lead capture.",
    suggestedSlug: "campaign",
    sections: [
      {
        section_type: "hero",
        sort_order: 10,
        headline: "Limited-time offer",
        subheadline: "Add campaign dates, eligibility, and primary offer details.",
        cta_text: "Claim offer",
        cta_url: "#offer",
        settings: { variant: "dark" },
      },
      {
        section_type: "text_block",
        sort_order: 20,
        headline: "Offer details",
        body: "Terms, participating stores, and how customers can redeem.",
      },
      {
        section_type: "cta_band",
        sort_order: 30,
        headline: "Don't miss out",
        settings: {
          buttons: [
            { label: "Shop inventory", url: "/inventory" },
            { label: "Contact us", url: "/about-us" },
          ],
        },
      },
      {
        section_type: "form",
        sort_order: 40,
        headline: "Get offer details",
        settings: { form_type: "general" },
      },
    ],
  },
  {
    id: "schedule_service",
    label: "Schedule Service Page",
    description: "Service scheduling hero, instructions, form, and store list.",
    suggestedSlug: "schedule-service-page",
    sections: [
      {
        section_type: "hero",
        sort_order: 10,
        headline: "Schedule your service appointment",
        subheadline: "Book maintenance or repairs at your preferred Cavender location.",
        cta_text: "Book now",
        cta_url: "#schedule",
      },
      {
        section_type: "text_block",
        sort_order: 20,
        headline: "What to expect",
        body: "Explain appointment steps, loaner vehicles, and what to bring.",
      },
      {
        section_type: "form",
        sort_order: 30,
        headline: "Request an appointment",
        settings: { form_type: "service" },
      },
      {
        section_type: "locations",
        sort_order: 40,
        headline: "Choose a location",
        subheadline: "Select the store that is most convenient for you.",
      },
    ],
  },
  {
    id: "cavender_commitment",
    label: "Cavender Commitment Page",
    description: "Brand promise hero, commitment band, supporting copy, and CTA.",
    suggestedSlug: "cavender-commitment",
    sections: [
      {
        section_type: "hero",
        sort_order: 10,
        headline: "The Cavender Commitment",
        subheadline: "Our promise to every customer, every visit.",
        settings: { variant: "light" },
      },
      {
        section_type: "cavender_commitment",
        sort_order: 20,
        headline: "Built on trust",
        body: "Edit commitment pillars and supporting copy in the page builder.",
      },
      {
        section_type: "text_block",
        sort_order: 30,
        headline: "What it means for you",
        body: "Expand on transparency, service, and community values.",
      },
      {
        section_type: "cta_band",
        sort_order: 40,
        headline: "Experience the difference",
        settings: {
          buttons: [
            { label: "Shop inventory", url: "/inventory" },
            { label: "Find a store", url: "/about-us" },
          ],
        },
      },
    ],
  },
];

export function getPageTemplate(id: PageTemplateId): PageTemplateDefinition {
  const template = PAGE_TEMPLATES.find((t) => t.id === id);
  if (!template) throw new Error(`Unknown page template: ${id}`);
  return template;
}

export function isPageTemplateId(value: string): value is PageTemplateId {
  return (PAGE_TEMPLATE_IDS as readonly string[]).includes(value);
}
