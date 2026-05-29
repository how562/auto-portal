import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

export interface ExecutiveProfile {
  id: string;
  name: string;
  title: string;
  image: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
}

export type ExecutiveValueIcon =
  | "integrity"
  | "teamwork"
  | "excellence"
  | "community";

export interface ExecutiveValue {
  id: string;
  title: string;
  description: string;
  icon: ExecutiveValueIcon;
}

export interface ExecutiveTeamPageContent {
  header?: PageHeaderConfig;
  hero: {
    title: string;
    tagline: string[];
    imageUrl: string;
  };
  intro: {
    eyebrow: string;
    headline: string;
    paragraph: string;
  };
  executives: ExecutiveProfile[];
  leadershipMessage: {
    eyebrow: string;
    headline: string;
    body: string;
    values: ExecutiveValue[];
  };
  cta: {
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
}

const PORTRAIT_IMAGES = [
  "/images/hero/lifestyle.jpg",
  "/images/hero/community.jpg",
  "/images/hero/vehicle.jpg",
  "/images/hero/dealership.jpg",
] as const;

function portraitForIndex(index: number): string {
  return PORTRAIT_IMAGES[index % PORTRAIT_IMAGES.length];
}

export const EXECUTIVE_TEAM_PAGE_CONTENT: ExecutiveTeamPageContent = {
  hero: {
    title: "Our Leadership",
    tagline: [
      "Experienced. Driven. Committed to you.",
      "Meet the leaders guiding Cavender Auto Group forward.",
    ],
    imageUrl: "/images/hero/dealership.jpg",
  },
  intro: {
    eyebrow: "Executive Team",
    headline: "Leadership that drives excellence.",
    paragraph:
      "Our executive team brings decades of experience in the automotive industry and a shared commitment to people, performance, and the communities we serve.",
  },
  executives: [
    {
      id: "ceo",
      name: "Executive Name",
      title: "Chief Executive Officer",
      image: portraitForIndex(0),
      email: "ceo@cavender.com",
      phone: "(210) 555-0101",
      linkedinUrl: "https://www.linkedin.com/",
    },
    {
      id: "coo",
      name: "Executive Name",
      title: "Chief Operating Officer",
      image: portraitForIndex(1),
      email: "coo@cavender.com",
      linkedinUrl: "https://www.linkedin.com/",
    },
    {
      id: "cfo",
      name: "Executive Name",
      title: "Chief Financial Officer",
      image: portraitForIndex(2),
      email: "cfo@cavender.com",
      phone: "(210) 555-0103",
    },
    {
      id: "cmo",
      name: "Executive Name",
      title: "Chief Marketing Officer",
      image: portraitForIndex(3),
      phone: "(210) 555-0104",
      linkedinUrl: "https://www.linkedin.com/",
    },
    {
      id: "cpo",
      name: "Executive Name",
      title: "Chief People Officer",
      image: portraitForIndex(0),
      email: "people@cavender.com",
    },
    {
      id: "cso",
      name: "Executive Name",
      title: "Chief Strategy Officer",
      image: portraitForIndex(1),
      email: "strategy@cavender.com",
      phone: "(210) 555-0106",
      linkedinUrl: "https://www.linkedin.com/",
    },
  ],
  leadershipMessage: {
    eyebrow: "Leading With Purpose",
    headline: "People first. Always.",
    body: "Every decision starts with our customers, our team members, and the communities we serve.",
    values: [
      {
        id: "integrity",
        title: "Integrity",
        description: "We do what we say and stand behind every promise.",
        icon: "integrity",
      },
      {
        id: "teamwork",
        title: "Teamwork",
        description: "Success is built together — across every store and role.",
        icon: "teamwork",
      },
      {
        id: "excellence",
        title: "Excellence",
        description: "We hold ourselves to the highest standard in everything we do.",
        icon: "excellence",
      },
      {
        id: "community",
        title: "Community",
        description: "We're invested in the people and places we call home.",
        icon: "community",
      },
    ],
  },
  cta: {
    primaryLabel: "Contact Us",
    primaryHref: "/contact-the-cavenders",
    secondaryLabel: "View Our Locations",
    secondaryHref: "/locations",
  },
};
