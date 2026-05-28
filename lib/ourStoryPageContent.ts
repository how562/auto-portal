export interface OurStoryMilestone {
  id: string;
  year: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  linkLabel: string;
  linkUrl: string;
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
    milestones: OurStoryMilestone[];
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

const TIMELINE_IMAGE = "/images/hero/dealership.jpg";

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
    title: "A legacy in motion",
    milestones: [
      {
        id: "1939",
        year: "1939",
        eyebrow: "The Beginning",
        title: "The Beginning",
        description:
          "Cavender Auto Group traces its roots to a family commitment to honest service and lasting relationships — the foundation of everything that followed.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Early Cavender dealership era",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "1950s",
        year: "1950s",
        eyebrow: "Relationships",
        title: "Building Relationships",
        description:
          "Through the post-war years, Cavender grew by earning trust one customer at a time — a tradition that still defines how we do business.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Mid-century automotive retail",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "1970s",
        year: "1970s",
        eyebrow: "Expansion",
        title: "Growth Across Texas",
        description:
          "As Texas expanded, so did Cavender — deepening roots in the communities we serve while staying true to family values.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Texas expansion",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "1990s",
        year: "1990s",
        eyebrow: "Legacy",
        title: "A Family Legacy Expands",
        description:
          "New generations joined the business, carrying forward a standard of integrity and community investment across multiple locations.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Family legacy",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "2000s",
        year: "2000s",
        eyebrow: "Growth",
        title: "New Brands, New Communities",
        description:
          "Cavender welcomed additional franchises and markets — always with the same promise: treat people right and stand behind what we sell.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Modern dealership growth",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "2021",
        year: "2021",
        eyebrow: "Philanthropy",
        title: "Cavender Cares",
        description:
          "Cavender Cares launched as a dedicated philanthropic branch — channeling employee passion and company resources into the communities we call home.",
        imageUrl: "/images/hero/community.jpg",
        imageAlt: "Cavender Cares community giving",
        linkLabel: "Explore Cavender Cares",
        linkUrl: "/cavender-cares",
      },
      {
        id: "today",
        year: "Today",
        eyebrow: "Present",
        title: "Serving Texas With One Standard",
        description:
          "Today, Cavender Auto Group represents multiple brands and dealerships united by one standard of excellence — for customers, teammates, and neighbors.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "Cavender Auto Group today",
        linkLabel: "",
        linkUrl: "",
      },
      {
        id: "tomorrow",
        year: "Tomorrow",
        eyebrow: "Future",
        title: "The Road Ahead",
        description:
          "The next chapter is written with the same principles that began in 1939: family, trust, community, and progress — for generations to come.",
        imageUrl: TIMELINE_IMAGE,
        imageAlt: "The road ahead",
        linkLabel: "",
        linkUrl: "",
      },
    ],
  },
  legacy: {
    heading: "Built on family. Driven by trust.",
    body: "For generations, Cavender Auto Group has grown by staying focused on people — our customers, our team members, and the communities we serve.",
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
