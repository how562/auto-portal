import type { PageSectionUpdateInput } from "./cmsAdmin";
import type { CMSLibrarySectionType } from "./cmsSectionLibrary";
import type { CMSSectionType } from "./cmsTypes";

const DEFAULT_DESIGN: Record<string, string> = {
  padding_top: "default",
  padding_bottom: "default",
  margin_top: "none",
  margin_bottom: "none",
};

function withDefaultDesign(
  settings: Record<string, unknown> = {},
): Record<string, unknown> {
  return { ...DEFAULT_DESIGN, ...settings };
}

/** Starter content applied when a section is added from the visual picker. */
export function getSectionStarter(
  type: CMSLibrarySectionType,
): PageSectionUpdateInput {
  switch (type) {
    case "hero":
      return {
        eyebrow: "Welcome",
        headline: "Find your next vehicle with confidence",
        subheadline:
          "Guided discovery across real inventory, tailored to how you shop.",
        cta_text: "Browse inventory",
        cta_url: "/inventory",
        settings: withDefaultDesign({
          variant: "light",
          cta_label: "Browse inventory",
          cta_href: "/inventory",
        }),
      };
    case "text_block":
      return {
        headline: "Built for clarity",
        body:
          "Use this text block for policies, brand story, or any long-form copy that needs room to breathe.\n\nSeparate paragraphs with a blank line. Keep sentences short and scannable.",
        settings: withDefaultDesign({ alignment: "left" }),
      };
    case "image_text":
      return {
        headline: "Service you can see",
        subheadline: "Why drivers choose us",
        body:
          "Pair a strong headline with 2–3 short paragraphs. Upload an image that supports the story — team, facility, or product.\n\nReplace this placeholder copy with your message.",
        settings: withDefaultDesign({
          image_position: "right",
          media_type: "image",
        }),
      };
    case "split_feature":
      return {
        headline: "Two reasons to visit",
        settings: withDefaultDesign({
          left_title: "Transparent pricing",
          left_body:
            "See real numbers up front — no surprises when you arrive on the lot.",
          right_title: "Expert guidance",
          right_body:
            "Work with advisors who listen first, then match you to the right vehicle.",
        }),
      };
    case "half_half":
      return {
        eyebrow: "About Us",
        headline: "Built on trust.",
        subheadline: "Driven by people.",
        body:
          "Cavender Auto Group has been serving Texas for over 85 years — and we're proud to say that much of our success comes from the trust built with the families and communities we serve every day.\n\nWe're not just here to sell cars. We're here to build lasting relationships founded on honesty, respect, and service you can trust.",
        image_url: "/images/hero/community.jpg",
        settings: withDefaultDesign({
          preset_key: "half_half",
          signature_text: "Cavender Family",
          image_alt: "Cavender Auto Group team",
          image_position: "right",
          variant: "compact",
        }),
      };
    case "cta_band":
      return {
        headline: "Ready to take the next step?",
        subheadline: "Browse inventory or schedule a visit at your nearest location.",
        settings: withDefaultDesign({
          variant: "dark",
          buttons: [
            { label: "Browse inventory", url: "/inventory" },
            { label: "Contact us", url: "/#locations" },
          ],
        }),
      };
    case "card_grid":
      return {
        headline: "Explore our programs",
        subheadline: "Three highlights — replace titles, copy, and links with your own.",
        settings: withDefaultDesign({
          cards: [
            {
              title: "New inventory",
              body: "Latest arrivals across every store, updated daily.",
              link_label: "Shop new",
              link_href: "/inventory?condition=new",
            },
            {
              title: "Pre-owned",
              body: "Certified and value picks with transparent history.",
              link_label: "Shop pre-owned",
              link_href: "/inventory?condition=used",
            },
            {
              title: "Financing",
              body: "Flexible options with advisors who explain every step.",
              link_label: "Learn more",
              link_href: "/#how-it-works",
            },
          ],
        }),
      };
    case "faq":
      return {
        headline: "Frequently asked questions",
        settings: withDefaultDesign({
          items: [
            {
              question: "Do you offer financing?",
              answer:
                "Yes — our team works with multiple lenders to find options that fit your budget.",
            },
            {
              question: "Can I schedule a test drive online?",
              answer:
                "Absolutely. Use the contact form or call your nearest store to book a time.",
            },
            {
              question: "What should I bring to the dealership?",
              answer:
                "A valid driver license and proof of insurance are helpful; financing may require income verification.",
            },
          ],
        }),
      };
    case "stats":
      return {
        headline: "By the numbers",
        settings: withDefaultDesign({
          items: [
            { value: "40+", label: "Years serving Texas" },
            { value: "12", label: "Dealership locations" },
            { value: "5k+", label: "Vehicles in stock" },
            { value: "98%", label: "Customer satisfaction" },
          ],
        }),
      };
    case "locations":
      return {
        headline: "Our locations",
        subheadline: "Visit a store near you — hours and contact details are listed below.",
        settings: withDefaultDesign(),
      };
    case "inventory_collection":
      return {
        headline: "Featured inventory",
        subheadline:
          "Select a smart collection in section settings to populate this rail with live vehicles.",
        settings: withDefaultDesign({ limit: 12 }),
      };
    case "custom_html":
      return {
        headline: "Custom content block",
        body: "Plain-text fallback if HTML is empty or fails safety checks.",
        settings: withDefaultDesign({
          html: `<p>This block supports <strong>limited HTML</strong> for tables, links, and emphasis. Replace with your embed or markup.</p>`,
        }),
      };
    default:
      return {};
  }
}

/** Starters for any section type used by saved presets or utilities. */
export function getStarterForSectionType(type: CMSSectionType): PageSectionUpdateInput {
  switch (type) {
    case "form":
      return {
        headline: "Get in touch",
        subheadline: "Send a message and our team will respond shortly.",
        settings: withDefaultDesign({ form_type: "lead" }),
      };
    default:
      if (
        (
          [
            "hero",
            "text_block",
            "image_text",
            "split_feature",
            "half_half",
            "cta_band",
            "card_grid",
            "faq",
            "stats",
            "locations",
            "inventory_collection",
            "custom_html",
          ] as const
        ).includes(type as CMSLibrarySectionType)
      ) {
        return getSectionStarter(type as CMSLibrarySectionType);
      }
      return {};
  }
}
