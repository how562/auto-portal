import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

export type CommitmentFeatureIcon =
  | "oil"
  | "shield"
  | "location"
  | "community";

export type CommitmentBenefitIcon =
  | "oil-life"
  | "locations"
  | "service"
  | "confidence";

export interface CommitmentFeature {
  id: string;
  icon: CommitmentFeatureIcon;
  title: string;
  description: string;
}

export interface CommitmentBenefit {
  id: string;
  icon: CommitmentBenefitIcon;
  title: string;
  description: string;
}

export interface CommitmentHonorPillar {
  id: string;
  icon: "military" | "texas-valor" | "giving-back";
  label: string;
}

export interface CommitmentFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface CommitmentLocationCard {
  id: string;
  name: string;
  city: string;
  imageUrl: string;
  href: string;
}

export interface CommitmentIntelPhoto {
  id: string;
  figureLabel: string;
  imageUrl: string;
  caption: string;
  location?: string;
}

export interface CavenderCommitmentPageContent {
  header?: PageHeaderConfig;
  memo: {
    classification: string;
    documentId: string;
    subject: string;
    from: string;
    to: string;
    dateLabel: string;
  };
  hero: {
    imageUrl: string;
    headlineLine1: string;
    headlineLine2: string;
    headlineAccent: string;
    subheadline: string;
    body: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
  };
  veteransVideo: {
    sectionId: string;
    eyebrow: string;
    headline: string;
    body: string;
    videoUrl: string;
    posterUrl: string;
  };
  explanation: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    imageUrl: string;
  };
  intro: {
    headline: string;
    body: string;
    features: CommitmentFeature[];
  };
  disclaimer: {
    headline: string;
    paragraphs: string[];
  };
  benefits: {
    headline: string;
    items: CommitmentBenefit[];
  };
  intel: {
    preparedBy: string;
    body: string;
    items: CommitmentIntelPhoto[];
  };
  honor: {
    headlineLine1: string;
    headlineLine2: string;
    body: string;
    mainImageUrl: string;
    secondaryImageUrl: string;
    tertiaryImageUrl: string;
    pillars: CommitmentHonorPillar[];
  };
  locations: {
    headline: string;
    viewAllLabel: string;
    viewAllHref: string;
  };
  faq: {
    headline: string;
    items: CommitmentFaqItem[];
  };
  finalCta: {
    headline: string;
    body: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    tertiaryCta: { label: string; href: string };
  };
  footerStrip: {
    items: { id: string; icon: "texas" | "since" | "community"; label: string }[];
  };
}

export const CAVENDER_COMMITMENT_PAGE_CONTENT: CavenderCommitmentPageContent = {
  memo: {
    classification: "INTERNAL — MILITARY APPRECIATION",
    documentId: "REF: CC-OPS-2026-001",
    subject: "OPERATION CAVENDER COMMITMENT — MISSION BRIEF & FIELD REPORT",
    from: "Cavender Auto Group — Military Appreciation Command",
    to: "All Veterans, Active-Duty Service Members & Military Families",
    dateLabel: "DISTRIBUTION: IMMEDIATE",
  },
  hero: {
    imageUrl: "/images/hero/community.jpg",
    headlineLine1: "Cavender",
    headlineLine2: "Commitment",
    headlineAccent: "Free oil changes for life for veterans and active-duty military.",
    subheadline: "",
    body: "",
    primaryCta: { label: "View Eligible Vehicles", href: "/inventory" },
    secondaryCta: { label: "Watch Our Story", href: "#cc-veterans-video" },
  },
  veteransVideo: {
    sectionId: "cc-veterans-video",
    eyebrow: "From our team",
    headline: "Hear from veterans who work at Cavender",
    body: "Our teammates who served in uniform share what the Cavender Commitment means — and why supporting military families is personal to us.",
    videoUrl: "/media/cavender-commitment/veterans.mp4",
    posterUrl: "/images/hero/lifestyle.jpg",
  },
  explanation: {
    eyebrow: "The program",
    headline: "More than a thank-you.",
    headlineAccent: "A lifetime of support.",
    imageUrl: "/images/hero/lifestyle.jpg",
  },
  intro: {
    headline: "What is the Cavender Commitment?",
    body: "The Cavender Commitment is a lifetime benefit for veterans and active-duty military members who purchase a qualifying vehicle from Cavender Auto Group. It is our way of honoring your service with real savings, certified service, and support at every Cavender dealership in Texas.",
    features: [
      {
        id: "oil",
        icon: "oil",
        title: "FREE OIL CHANGES FOR LIFE",
        description: "Complimentary oil changes for the life of your vehicle when serviced at Cavender.",
      },
      {
        id: "military",
        icon: "shield",
        title: "MILITARY APPRECIATION",
        description: "Exclusive recognition and savings for veterans and active-duty service members.",
      },
      {
        id: "support",
        icon: "location",
        title: "LONG-TERM SUPPORT",
        description: "Benefits that stay with you — at every Cavender dealership across Texas.",
      },
      {
        id: "community",
        icon: "community",
        title: "COMMUNITY COMMITMENT",
        description: "Proud partners with military and community organizations statewide.",
      },
    ],
  },
  disclaimer: {
    headline: "Important information",
    paragraphs: [
      "The Cavender Commitment is available at participating Cavender Auto Group dealerships for eligible veterans and active-duty military members who purchase a qualifying new or pre-owned vehicle, subject to program terms presented at the time of sale.",
      "Complimentary oil changes for life apply to the qualifying vehicle while you own it, when serviced at a participating Cavender location, and may require proof of military service. Oil type and service frequency follow program guidelines.",
      "Benefits are non-transferable to subsequent vehicle owners. Cavender Auto Group may modify or discontinue the program at any time. See your sales or service advisor for complete eligibility and enrollment details.",
      "This page provides general program information only and is not an official communication of the U.S. government or any branch of the armed forces.",
    ],
  },
  intel: {
    preparedBy: "Field documentation prepared by Dina — Military & Community Programs, Cavender Auto Group",
    body: "The following imagery constitutes verified field intel: community outreach, military appreciation events, and on-the-ground program activity coordinated through our commitment team.",
    items: [
      {
        id: "intel-1",
        figureLabel: "FIG. 1",
        imageUrl: "/images/hero/community.jpg",
        caption: "Community engagement — military appreciation outreach on site.",
        location: "San Antonio metro",
      },
      {
        id: "intel-2",
        figureLabel: "FIG. 2",
        imageUrl: "/images/hero/lifestyle.jpg",
        caption: "Program activation — honoring service members and their families.",
        location: "Cavender event",
      },
      {
        id: "intel-3",
        figureLabel: "FIG. 3",
        imageUrl: "/images/hero/dealership.jpg",
        caption: "Operational footprint — dealership ready to support enrolled personnel.",
        location: "Texas",
      },
      {
        id: "intel-4",
        figureLabel: "FIG. 4",
        imageUrl: "/images/hero/vehicle.jpg",
        caption: "Asset delivery — qualifying vehicles enrolled in the Commitment program.",
      },
      {
        id: "intel-5",
        figureLabel: "FIG. 5",
        imageUrl: "/images/hero/community.jpg",
        caption: "Partnership activity — Texas Valor Project and local military organizations.",
      },
      {
        id: "intel-6",
        figureLabel: "FIG. 6",
        imageUrl: "/images/hero/lifestyle.jpg",
        caption: "Ongoing operations — Dina’s team documenting commitment in the field.",
      },
    ],
  },
  benefits: {
    headline: "Operational benefits — authorized entitlements",
    items: [
      {
        id: "oil-life",
        icon: "oil-life",
        title: "Free Oil Changes for Life",
        description:
          "Receive complimentary conventional, synthetic blend, or full synthetic oil changes for the life of your qualifying vehicle when you service with Cavender.",
      },
      {
        id: "multi-location",
        icon: "locations",
        title: "Multi-Location Support",
        description:
          "Your Cavender Commitment travels with you. Redeem benefits at any participating Cavender Auto Group location.",
      },
      {
        id: "certified",
        icon: "service",
        title: "Certified Service Experts",
        description:
          "Factory-trained technicians using genuine parts and manufacturer-approved procedures — so your vehicle stays protected.",
      },
      {
        id: "confidence",
        icon: "confidence",
        title: "Confidence After Your Purchase",
        description:
          "Drive with peace of mind knowing Cavender stands behind your purchase with long-term care built for military families.",
      },
    ],
  },
  honor: {
    headlineLine1: "MORE THAN A BENEFIT.",
    headlineLine2: "IT'S OUR HONOR.",
    body: "For generations, Cavender Auto Group has been rooted in Texas values — integrity, family, and service. The Cavender Commitment is not a promotion. It is a promise to those who have worn the uniform and to the families who stand beside them.",
    mainImageUrl: "/images/hero/lifestyle.jpg",
    secondaryImageUrl: "/images/hero/dealership.jpg",
    tertiaryImageUrl: "/images/hero/vehicle.jpg",
    pillars: [
      { id: "military", icon: "military", label: "Proudly Serving Our Military Community" },
      { id: "valor", icon: "texas-valor", label: "Committed To Texas Valor Project" },
      { id: "giving", icon: "giving-back", label: "Giving Back To Those Who Gave" },
    ],
  },
  locations: {
    headline: "CAVENDER LOCATIONS NEAR YOU",
    viewAllLabel: "View All Locations",
    viewAllHref: "/locations",
  },
  faq: {
    headline: "FREQUENTLY ASKED QUESTIONS",
    items: [
      {
        id: "who",
        question: "Who is eligible for the Cavender Commitment?",
        answer:
          "Veterans and active-duty military members who purchase a qualifying new or pre-owned vehicle from Cavender Auto Group may enroll in the program.",
      },
      {
        id: "oil",
        question: "What oil changes are included?",
        answer:
          "Conventional, synthetic blend, and full synthetic oil changes are included per program guidelines when performed at a participating Cavender service department.",
      },
      {
        id: "transfer",
        question: "Can I use my benefits at any Cavender location?",
        answer:
          "Yes. Benefits are honored at participating Cavender Auto Group dealerships across our network.",
      },
      {
        id: "transfer-vehicle",
        question: "Does the benefit transfer if I sell my vehicle?",
        answer:
          "The Cavender Commitment is tied to the original qualifying purchase and is non-transferable to subsequent owners.",
      },
      {
        id: "schedule",
        question: "How do I schedule a complimentary oil change?",
        answer:
          "Schedule service online or contact your local Cavender service department. Please mention the Cavender Commitment when booking.",
      },
      {
        id: "proof",
        question: "What documentation do I need to enroll?",
        answer:
          "Valid military ID or proof of service may be required at enrollment. Your Cavender sales or service advisor can confirm acceptable documentation.",
      },
    ],
  },
  finalCta: {
    headline: "Experience the CAVENDER COMMITMENT.",
    body: "We're here for you — today, tomorrow, and for the life of your vehicle.",
    primaryCta: { label: "Shop Vehicles", href: "/inventory" },
    secondaryCta: { label: "Schedule Service", href: "/schedule-service" },
    tertiaryCta: { label: "Contact Us", href: "/about-us" },
  },
  footerStrip: {
    items: [
      { id: "texas", icon: "texas", label: "Texas Family Owned & Operated" },
      { id: "since", icon: "since", label: "Serving Texas For Over 90 Years" },
      { id: "community", icon: "community", label: "Committed To Our Community" },
    ],
  },
};
