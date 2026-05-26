import type { PageSectionUpdateInput } from "./cmsAdmin";
import type { CMSLibrarySectionType } from "./cmsSectionLibrary";
import { getSectionStarter } from "./cmsSectionStarters";

export type PageTemplateId =
  | "landing"
  | "about"
  | "community"
  | "service"
  | "finance"
  | "campaign";

export interface PageTemplateSectionSpec {
  type: CMSLibrarySectionType;
  /** Overrides default starter for this template */
  starter?: PageSectionUpdateInput;
}

export interface PageTemplate {
  id: PageTemplateId;
  label: string;
  description: string;
  bestFor: string;
  suggestedTitle: string;
  suggestedSlug: string;
  suggestedMeta?: string;
  /** Wireframe section types in order (for template card preview) */
  sectionTypes: CMSLibrarySectionType[];
  sections: PageTemplateSectionSpec[];
}

function mergeStarter(
  type: CMSLibrarySectionType,
  override?: PageSectionUpdateInput,
): PageSectionUpdateInput {
  const base = getSectionStarter(type);
  if (!override) return base;
  return {
    ...base,
    ...override,
    settings: { ...(base.settings ?? {}), ...(override.settings ?? {}) },
  };
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "landing",
    label: "Basic Landing Page",
    description: "Hero, story, proof points, and conversion bands.",
    bestFor: "Campaign landings, model launches, and paid traffic destinations.",
    suggestedTitle: "Landing page",
    suggestedSlug: "landing",
    suggestedMeta: "Discover inventory, offers, and next steps.",
    sectionTypes: ["hero", "image_text", "stats", "cta_band", "faq"],
    sections: [
      {
        type: "hero",
        starter: {
          eyebrow: "Cavender Auto Group",
          headline: "Drive home something you'll love",
          subheadline:
            "Real inventory, transparent pricing, and advisors who listen first.",
          cta_text: "Shop inventory",
          cta_url: "/inventory",
          settings: {
            variant: "light",
            padding_top: "spacious",
            padding_bottom: "default",
          },
        },
      },
      {
        type: "image_text",
        starter: {
          headline: "Why shop with us",
          subheadline: "The Cavender difference",
          body: "From first click to keys in hand, we keep the process simple.\n\nBrowse online, narrow your list, then visit a store that already knows what you're looking for.",
          settings: { image_position: "right" },
        },
      },
      { type: "stats" },
      {
        type: "cta_band",
        starter: {
          headline: "See what's on the lot today",
          subheadline: "Thousands of vehicles across Texas — updated daily.",
          settings: { variant: "dark" },
        },
      },
      { type: "faq" },
    ],
  },
  {
    id: "about",
    label: "About Page",
    description: "Brand story, team proof, programs, and locations.",
    bestFor: "Company overview, leadership, and trust-building content.",
    suggestedTitle: "About us",
    suggestedSlug: "about-us",
    sectionTypes: ["hero", "text_block", "split_feature", "card_grid", "locations"],
    sections: [
      {
        type: "hero",
        starter: {
          eyebrow: "Our story",
          headline: "Built on relationships, not transactions",
          subheadline: "Family-owned dealerships serving Texas drivers for generations.",
          settings: { variant: "light", background_color: "#f7f4ef" },
        },
      },
      {
        type: "text_block",
        starter: {
          headline: "Who we are",
          body: "We started with one store and a simple promise: treat every guest like a neighbor.\n\nToday we're a growing group of dealerships — still guided by transparency, community, and long-term trust.",
          settings: { alignment: "left" },
        },
      },
      { type: "split_feature" },
      { type: "card_grid" },
      { type: "locations" },
    ],
  },
  {
    id: "community",
    label: "Community Page",
    description: "Local impact, events, and ways to get involved.",
    bestFor: "Sponsorships, charity drives, and hometown storytelling.",
    suggestedTitle: "Community",
    suggestedSlug: "community",
    sectionTypes: ["hero", "text_block", "image_text", "card_grid", "cta_band"],
    sections: [
      {
        type: "hero",
        starter: {
          eyebrow: "Community",
          headline: "Proud to serve the places we call home",
          subheadline: "Partnerships, events, and giving back across Texas.",
          settings: { variant: "dark", background_color: "#1e3556" },
        },
      },
      {
        type: "text_block",
        starter: {
          headline: "More than a dealership",
          body: "Our teams volunteer, sponsor youth sports, and support local nonprofits year-round.\n\nTell your story here — highlight recent events, photos, and quotes from partners.",
        },
      },
      {
        type: "image_text",
        starter: {
          headline: "Recent highlights",
          subheadline: "On the ground in your city",
          body: "Swap in photos from your latest event or fundraiser.\n\nKeep copy short and celebratory — this section should feel human, not corporate.",
          settings: { image_position: "left" },
        },
      },
      { type: "card_grid" },
      {
        type: "cta_band",
        starter: {
          headline: "Partner with us",
          subheadline: "Reach out for sponsorships, donations, or community requests.",
          settings: {
            variant: "dark",
            buttons: [{ label: "Contact us", url: "/#contact" }],
          },
        },
      },
    ],
  },
  {
    id: "service",
    label: "Service Page",
    description: "Service promise, amenities, and appointment CTAs.",
    bestFor: "Service departments, maintenance menus, and warranty info.",
    suggestedTitle: "Service & parts",
    suggestedSlug: "service",
    sectionTypes: ["hero", "image_text", "split_feature", "faq", "cta_band"],
    sections: [
      {
        type: "hero",
        starter: {
          eyebrow: "Service center",
          headline: "Expert care for every mile",
          subheadline: "Factory-trained technicians, genuine parts, and convenient scheduling.",
          cta_text: "Schedule service",
          cta_url: "/#contact",
        },
      },
      {
        type: "image_text",
        starter: {
          headline: "What to expect",
          body: "Transparent estimates, loaner options where available, and status updates you don't have to chase.\n\nAdd your store's hours, amenities, and certification badges here.",
          settings: { image_position: "right" },
        },
      },
      { type: "split_feature" },
      { type: "faq" },
      {
        type: "cta_band",
        starter: {
          headline: "Book your visit",
          subheadline: "Pick a time online or call your nearest store.",
          settings: { variant: "light", background_color: "#ffffff" },
        },
      },
    ],
  },
  {
    id: "finance",
    label: "Finance Page",
    description: "Financing options, numbers, and common questions.",
    bestFor: "Credit applications, lease vs buy, and payment education.",
    suggestedTitle: "Financing",
    suggestedSlug: "finance",
    sectionTypes: ["hero", "text_block", "stats", "faq", "cta_band"],
    sections: [
      {
        type: "hero",
        starter: {
          eyebrow: "Financing",
          headline: "Payments that fit your budget",
          subheadline: "Competitive rates, flexible terms, and advisors who explain every line.",
          cta_text: "Get pre-qualified",
          cta_url: "/#contact",
        },
      },
      {
        type: "text_block",
        starter: {
          headline: "Simple, transparent process",
          body: "We work with multiple lenders to find options for a wide range of credit profiles.\n\nReplace this with your compliance-approved disclosures and process steps.",
          settings: { alignment: "left" },
        },
      },
      {
        type: "stats",
        starter: {
          headline: "Financing at a glance",
          settings: {
            items: [
              { value: "24hr", label: "Typical pre-qual response" },
              { value: "0%", label: "Promo APR offers*" },
              { value: "72mo", label: "Terms up to" },
              { value: "100%", label: "Online applications" },
            ],
          },
        },
      },
      { type: "faq" },
      {
        type: "cta_band",
        starter: {
          headline: "Ready to explore your options?",
          subheadline: "Apply online or visit a finance manager in store.",
          settings: { variant: "dark" },
        },
      },
    ],
  },
  {
    id: "campaign",
    label: "Campaign Page",
    description: "High-impact promo with inventory and repeated CTAs.",
    bestFor: "Seasonal sales, model events, and limited-time offers.",
    suggestedTitle: "Special offer",
    suggestedSlug: "offer",
    sectionTypes: ["hero", "cta_band", "inventory_collection", "stats", "cta_band"],
    sections: [
      {
        type: "hero",
        starter: {
          eyebrow: "Limited time",
          headline: "Event pricing ends soon",
          subheadline: "Shop select inventory with reduced rates and bonus offers.",
          cta_text: "View event inventory",
          cta_url: "/inventory",
          settings: {
            variant: "dark",
            background_color: "#0c1628",
            padding_top: "spacious",
          },
        },
      },
      {
        type: "cta_band",
        starter: {
          headline: "Don't miss these deals",
          subheadline: "Availability changes daily — reserve online or visit today.",
          settings: {
            variant: "light",
            background_color: "#ffffff",
            buttons: [{ label: "Shop now", url: "/inventory" }],
          },
        },
      },
      { type: "inventory_collection" },
      { type: "stats" },
      {
        type: "cta_band",
        starter: {
          headline: "Questions? We're here to help.",
          subheadline: "Call, chat, or stop by your nearest Cavender store.",
          settings: {
            variant: "dark",
            buttons: [
              { label: "Browse inventory", url: "/inventory" },
              { label: "Find a store", url: "/#locations" },
            ],
          },
        },
      },
    ],
  },
];

export function getPageTemplate(id: PageTemplateId): PageTemplate {
  const t = PAGE_TEMPLATES.find((p) => p.id === id);
  if (!t) throw new Error(`Unknown page template: ${id}`);
  return t;
}

export function listPageTemplates(): PageTemplate[] {
  return PAGE_TEMPLATES;
}

export function isPageTemplateId(id: string): id is PageTemplateId {
  return PAGE_TEMPLATES.some((t) => t.id === id);
}

export function buildTemplateSectionStarter(
  spec: PageTemplateSectionSpec,
): PageSectionUpdateInput {
  return mergeStarter(spec.type, spec.starter);
}
