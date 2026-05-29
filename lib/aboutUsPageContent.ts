import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

export interface AboutUsFeature {
  id: string;
  title: string;
  description: string;
  icon: "honesty" | "customer" | "quality";
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
    title: string;
    tagline: string[];
    imageUrl: string;
  };
  whoWeAre: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    paragraphs: string[];
    signature: string;
    imageUrl: string;
  };
  ourApproach: {
    eyebrow: string;
    headline: string;
    features: AboutUsFeature[];
    imageUrl: string;
  };
  ourValues: {
    eyebrow: string;
    headline: string;
    items: AboutUsValue[];
  };
}

export const ABOUT_US_PAGE_CONTENT: AboutUsPageContent = {
  hero: {
    title: "About Us",
    tagline: [
      "We're more than a dealership.",
      "We're a team that puts people first.",
    ],
    imageUrl: "/hero/dealership.jpg",
  },
  whoWeAre: {
    eyebrow: "Who We Are",
    headline: "Built on trust. Driven by",
    headlineAccent: "passion.",
    paragraphs: [
      "For decades, Cavender Auto Group has been a trusted name in Texas — not just for the vehicles we sell, but for the relationships we build. From your first visit to long after you drive off the lot, we're here for you.",
      "Our team brings together experience, integrity, and a genuine love for what we do. Whether you're buying your first car or your fifth, you'll find a group of people who listen, guide, and make the process feel easy.",
    ],
    signature: "The Cavender Auto Group Team",
    imageUrl: "/hero/community.jpg",
  },
  ourApproach: {
    eyebrow: "Our Approach",
    headline:
      "It's not just about selling cars. It's about building relationships.",
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
    imageUrl: "/hero/vehicle.jpg",
  },
  ourValues: {
    eyebrow: "Our Values",
    headline: "The standards we live by.",
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
