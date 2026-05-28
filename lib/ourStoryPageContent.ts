export interface OurStoryMilestone {
  id: string;
  /** Large display year or era marker (e.g. 1939, II, 80+). */
  year: string;
  /** Compact label for horizontal timeline navigation. */
  shortLabel?: string;
  /** Optional generation chapter label shown as a pill. */
  generation?: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  linkLabel: string;
  linkUrl: string;
  /** Finale milestone — expanded typography and closing emphasis. */
  variant?: "default" | "finale";
}

export interface OurStoryValue {
  id: string;
  title: string;
  description: string;
}

export interface OurStoryCtaButton {
  id: string;
  label: string;
  href: string;
}

export interface OurStoryPageContent {
  hero: {
    title: string;
    subtitle: string;
    supportingLine: string;
    imageUrl: string;
  };
  video: {
    heading: string;
    description: string;
    title: string;
    videoUrl: string;
    posterImage: string;
  };
  timeline: {
    eyebrow: string;
    title: string;
    intro: string;
    milestones: OurStoryMilestone[];
    finaleTagline: string;
  };
  legacy: {
    heading: string;
    body: string;
    values: OurStoryValue[];
  };
  cta: {
    heading: string;
    buttons: OurStoryCtaButton[];
  };
}

/** Optional historic photography — leave empty to show editorial placeholder. */
const TIMELINE_IMAGE = "";

export const OUR_STORY_PAGE_CONTENT: OurStoryPageContent = {
  hero: {
    title: "Our Story",
    subtitle: "Over 85 years of family, community, and automotive excellence.",
    supportingLine:
      "From our early beginnings to serving communities across Texas, the Cavender story is built on people, trust, and progress.",
    imageUrl: "/images/hero/dealership.jpg",
  },
  video: {
    heading: "The Cavender Story",
    description:
      "Watch the story behind the people, values, and legacy that shaped Cavender Auto Group.",
    title: "The Cavender Story",
    videoUrl: "",
    posterImage: "/images/hero/community.jpg",
  },
  timeline: {
    eyebrow: "Since 1939",
    title: "A generational legacy",
    intro:
      "From a single Oldsmobile dealership to one of Texas’s premier automotive groups — four generations, one family name, and a promise that has never changed.",
    finaleTagline: "Confidence Is Cavender",
    milestones: [
      {
        id: "1939",
        year: "1939",
        shortLabel: "1939",
        eyebrow: "Chapter I",
        title: "The Beginning",
        description:
          "E.A. Kenzel convinced James Cavender to become the sales manager of his Oldsmobile dealership. Shortly after, James purchased the dealership, beginning the Cavender Auto Family legacy.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "James Cavender and the founding Cavender dealership era",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "1940s-1950s",
        year: "1940s–50s",
        shortLabel: "1950s",
        eyebrow: "Chapter II",
        title: "Building a Reputation",
        description:
          "James Cavender built the company around honesty, integrity, ethics, and customer trust — values that continue to define the Cavender name today.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Mid-century Cavender dealership and community trust",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "gen-2",
        year: "II",
        shortLabel: "Gen II",
        generation: "Second Generation",
        eyebrow: "Billy & Jimmy Cavender",
        title: "Twin sons, shared purpose",
        description:
          "James Cavender’s twin sons learned the business alongside their father. Billy eventually led the Cadillac dealership while Jimmy managed the Oldsmobile dealership, expanding the family legacy.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Second generation Cavender family leadership",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "gen-3",
        year: "III",
        shortLabel: "Gen III",
        generation: "Third Generation",
        eyebrow: "Continuing the tradition",
        title: "Work ethic & customer-first service",
        description:
          "The next generation carried forward the same work ethic and customer-first philosophy while growing the company throughout South Texas.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Third generation Cavender leadership in South Texas",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "gen-4",
        year: "IV",
        shortLabel: "Gen IV",
        generation: "Fourth Generation",
        eyebrow: "Today’s leadership",
        title: "Carrying the legacy forward",
        description:
          "Today, the fourth generation continues the traditions started over 80 years ago while leading Cavender Auto Group into the future.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Fourth generation Cavender Auto Group leadership",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "growth",
        year: "TX",
        shortLabel: "Growth",
        eyebrow: "South Texas",
        title: "Growth across South Texas",
        description:
          "From a single dealership in 1939 to one of the premier automotive groups in Texas, Cavender Auto Group now serves communities across South Texas with multiple dealership locations and hundreds of associates.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Cavender Auto Group dealerships across South Texas",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "cares",
        year: "Give",
        shortLabel: "Cares",
        eyebrow: "Community",
        title: "Cavender Cares",
        description:
          "The Cavender family believes that before a company can do well, it must first do good. Cavender Cares supports health and wellness, education, veterans, first responders, individuals with disabilities, and local charitable organizations throughout South Texas.",
        imageUrl: "/images/hero/community.jpg",
        imageAlt: "Cavender Cares community philanthropy across South Texas",
        linkLabel: "Explore Cavender Cares",
        linkUrl: "/cavender-cares",
      },
      {
        id: "confidence",
        year: "80+",
        shortLabel: "Today",
        generation: "Our promise",
        eyebrow: "Since 1939",
        title: "Confidence Is Cavender",
        description:
          "For more than 80 years, the Cavender name has stood for integrity, honesty, ethics, customer-first service, and community involvement.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Cavender Auto Group — Confidence Is Cavender",
        linkLabel: "",
        linkUrl: "",
        variant: "finale",
      },
    ],
  },
  legacy: {
    heading: "Built on family. Driven by trust.",
    body: "The principles that began in 1939 still guide every dealership, every associate, and every customer interaction across Cavender Auto Group.",
    values: [
      {
        id: "family",
        title: "Family",
        description: "A family-owned culture that puts relationships before transactions.",
      },
      {
        id: "trust",
        title: "Trust",
        description: "Honesty and accountability in every interaction, every day.",
      },
      {
        id: "community",
        title: "Community",
        description: "Deep roots in Texas — giving back through Cavender Cares and local partnership.",
      },
      {
        id: "progress",
        title: "Progress",
        description: "Evolving with our customers while honoring the standards that built our name.",
      },
    ],
  },
  cta: {
    heading: "Continue the Cavender story.",
    buttons: [
      {
        id: "leadership",
        label: "Meet Our Leadership",
        href: "/executive-team",
      },
      {
        id: "locations",
        label: "View Our Locations",
        href: "/locations",
      },
      {
        id: "careers",
        label: "Explore Careers",
        href: "/careers",
      },
    ],
  },
};
