import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

export interface AboutUsFeature {
  id: string;
  title: string;
  description: string;
  icon: "honesty" | "customer" | "quality";
}

export interface AboutUsPillar {
  id: string;
  title: string;
  description: string;
  icon: "local_roots" | "our_people" | "our_promise";
}

export interface AboutUsValue {
  id: string;
  title: string;
  description: string;
  icon: "integrity" | "respect" | "excellence" | "passion" | "community";
}

export interface AboutUsPageContent {
  header?: PageHeaderConfig;
  hero: {
    /** @deprecated use titleLine1 — kept for CMS migration */
    title?: string;
    /** @deprecated use introParagraphs */
    tagline?: string[];
    titleLine1: string;
    titleLine2: string;
    introParagraphs: string[];
    signature: string;
    imageUrl: string;
    imageAlt: string;
  };
  whoWeAre: {
    eyebrow: string;
    headline: string;
    paragraphs: string[];
    pillars: AboutUsPillar[];
    imageUrl: string;
    imageAlt: string;
  };
  ourApproach: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    features: AboutUsFeature[];
    imageUrl: string;
    imageAlt: string;
  };
  ourValues: {
    eyebrow: string;
    items: AboutUsValue[];
  };
}

export const ABOUT_US_PAGE_CONTENT: AboutUsPageContent = {
  hero: {
    titleLine1: "Built on trust.",
    titleLine2: "Driven by people.",
    introParagraphs: [
      "Cavender Auto Group has been serving Texas for over 85 years — and we're proud to say that much of our success comes from the trust built with the families and communities we serve every day.",
      "We're not just here to sell cars. We're here to build lasting relationships founded on honesty, respect, and service you can trust.",
    ],
    signature: "Cavender Family",
    imageUrl: "/images/hero/community.jpg",
    imageAlt: "Cavender Auto Group leadership team",
  },
  whoWeAre: {
    eyebrow: "Who We Are",
    headline: "A legacy built here in Texas.",
    paragraphs: [
      "Founded in San Antonio and grown across South Texas, Cavender Auto Group is family-owned and deeply rooted in the communities we serve. Our mission is simple: treat every guest the way we'd want our own family treated.",
    ],
    pillars: [
      {
        id: "local-roots",
        title: "Local Roots",
        description:
          "Born in Texas, built for Texas — we know the roads, the people, and the pride that comes with both.",
        icon: "local_roots",
      },
      {
        id: "our-people",
        title: "Our People",
        description:
          "A team of professionals who listen first, guide honestly, and stand behind every promise we make.",
        icon: "our_people",
      },
      {
        id: "our-promise",
        title: "Our Promise",
        description:
          "Straight answers, fair deals, and service you can count on long after you drive off the lot.",
        icon: "our_promise",
      },
    ],
    imageUrl: "/images/hero/dealership.jpg",
    imageAlt: "Cavender dealership exterior at dusk",
  },
  ourApproach: {
    eyebrow: "Our Approach",
    headline: "It's not just about selling cars.",
    headlineAccent: "It's about building relationships.",
    features: [
      {
        id: "honesty",
        title: "Honesty First",
        description:
          "We believe in straight answers, fair prices, and doing what's right — every time.",
        icon: "honesty",
      },
      {
        id: "customer",
        title: "Customer Focused",
        description:
          "Your needs come first. We listen, guide, and make the journey simple.",
        icon: "customer",
      },
      {
        id: "quality",
        title: "Quality You Can Count On",
        description:
          "Hand-picked vehicles and a team that stands behind every sale.",
        icon: "quality",
      },
    ],
    imageUrl: "/images/hero/vehicle.jpg",
    imageAlt: "Premium pickup truck at sunset",
  },
  ourValues: {
    eyebrow: "Our Values",
    items: [
      {
        id: "integrity",
        title: "Integrity",
        description: "We do what we say and stand behind every promise.",
        icon: "integrity",
      },
      {
        id: "respect",
        title: "Respect",
        description: "Every customer, teammate, and neighbor deserves our best.",
        icon: "respect",
      },
      {
        id: "excellence",
        title: "Excellence",
        description: "We hold ourselves to the highest standard in everything we do.",
        icon: "excellence",
      },
      {
        id: "passion",
        title: "Passion",
        description: "We love what we do — and it shows in how we serve.",
        icon: "passion",
      },
      {
        id: "community",
        title: "Community",
        description: "We're invested in the people and places we call home.",
        icon: "community",
      },
    ],
  },
};
