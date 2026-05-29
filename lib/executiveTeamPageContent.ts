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

const EXECUTIVE_PORTRAITS = {
  bobby: "/images/executive-team/bobby-cavender.png",
  lee: "/images/executive-team/lee-cavender.png",
  rob: "/images/executive-team/rob-cavender.png",
  jonathan: "/images/executive-team/jonathan-gray.png",
  amber: "/images/executive-team/amber-pfaff-chavez.png",
  misty: "/images/executive-team/misty-avila.png",
} as const;

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
      id: "bobby-cavender",
      name: "Bobby Cavender",
      title: "President",
      image: EXECUTIVE_PORTRAITS.bobby,
    },
    {
      id: "lee-cavender",
      name: "Lee Cavender",
      title: "Chief Development Officer",
      image: EXECUTIVE_PORTRAITS.lee,
    },
    {
      id: "rob-cavender",
      name: "Rob Cavender",
      title: "Chief Executive Officer",
      image: EXECUTIVE_PORTRAITS.rob,
    },
    {
      id: "jonathan-gray",
      name: "Jonathan Gray",
      title: "Chief Operating Officer",
      image: EXECUTIVE_PORTRAITS.jonathan,
    },
    {
      id: "amber-pfaff-chavez",
      name: "Amber Pfaff-Chavez",
      title: "Chief Financial Officer",
      image: EXECUTIVE_PORTRAITS.amber,
    },
    {
      id: "misty-avila",
      name: "Misty Avila",
      title: "Director of Human Resources",
      image: EXECUTIVE_PORTRAITS.misty,
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
