export interface CavenderCaresImpactStat {
  id: string;
  value: string;
  label: string;
}

export interface CavenderCaresPartner {
  id: string;
  name: string;
  logoUrl: string;
}

export interface CavenderCaresGalleryImage {
  id: string;
  imageUrl: string;
  alt: string;
}

export interface CavenderCaresPageContent {
  hero: {
    logoUrl: string;
    logoAlt: string;
    headline: string;
    backgroundImageUrl: string;
  };
  intro: {
    heading: string;
    body: string;
    imageUrl: string;
  };
  impact: CavenderCaresImpactStat[];
  partners: CavenderCaresPartner[];
  partnersMoreLabel: string;
  gallery: {
    heading: string;
    topRow: CavenderCaresGalleryImage[];
    bottomRow: CavenderCaresGalleryImage[];
  };
  closing: {
    paragraphs: string[];
  };
  contact: {
    line: string;
  };
}

const DEFAULT_GALLERY_TOP: CavenderCaresGalleryImage[] = [
  { id: "g1", imageUrl: "/images/hero/community.jpg", alt: "Community event" },
  { id: "g2", imageUrl: "/images/hero/community.jpg", alt: "Volunteer activity" },
  { id: "g3", imageUrl: "/images/hero/community.jpg", alt: "Cavender Cares outreach" },
];

const DEFAULT_GALLERY_BOTTOM: CavenderCaresGalleryImage[] = [
  { id: "g4", imageUrl: "/images/hero/community.jpg", alt: "Team giving back" },
  { id: "g5", imageUrl: "/images/hero/community.jpg", alt: "Community partnership" },
];

export const CAVENDER_CARES_PAGE_CONTENT: CavenderCaresPageContent = {
  hero: {
    logoUrl: "",
    logoAlt: "Cavender Cares",
    headline:
      "When it comes to community giving, an established philanthropic branch of the organization was created in 2021: Cavender Cares.",
    backgroundImageUrl: "/images/hero/community.jpg",
  },
  intro: {
    heading: "Auto dealerships are essential to their communities...",
    body: `The Cavender family has always had a heart for giving back to the community, but Cavender Cares had a mission to hire an expert in the community, that would focus on all aspects that the San Antonio and Boerne areas needed assistance with. Cavender Cares is supported by five pillars which include military support, education, health and wellness, safety and support, and community culture and traditions.

With those pillars in mind, Cavender Cares has successfully reached over 100 different non-profit organizations, contributed over 100 volunteer hours, hosted several supply and food drives, donated over $200,000 of employee income, and over half a million dollars in company profits. These acts resulted in Cavender Auto Group receiving the 2022 Corporate Philanthropy Award from the San Antonio Business Journal.`,
    imageUrl: "/images/hero/community.jpg",
  },
  impact: [
    { id: "orgs", value: "100+", label: "nonprofit organizations" },
    { id: "hours", value: "100+", label: "volunteer hours" },
    { id: "employee", value: "$200,000+", label: "employee income donated" },
    { id: "profits", value: "$500,000+", label: "company profits donated" },
  ],
  partners: [
    { id: "paws", name: "Paws for Purple Hearts", logoUrl: "" },
    { id: "doseum", name: "The DoSeum", logoUrl: "" },
    { id: "uso", name: "USO San Antonio", logoUrl: "" },
    { id: "make-a-wish", name: "Make-A-Wish Central & South Texas", logoUrl: "" },
    {
      id: "christus",
      name: "Christus Children's Foundation",
      logoUrl: "",
    },
  ],
  partnersMoreLabel: "and many more...",
  gallery: {
    heading: "Driven to Care: Cavender Cares in Focus",
    topRow: DEFAULT_GALLERY_TOP,
    bottomRow: DEFAULT_GALLERY_BOTTOM,
  },
  closing: {
    paragraphs: [
      "The secret to successful community giving? Employee involvement and partnerships within the community. A community is defined as a group of people that have common interests. A community can only achieve its definition by working together. One single person cannot spread community awareness to an entire company; it takes a team.",
      "Cavender Auto Group managed to do that by creating a team of Cavender Cares Ambassadors. Cavender Cares Ambassadors are volunteers from each Cavender dealership department, that attend community events and meetings, plan out a charitable plan of giving back throughout the year, and spread awareness and knowledge about community organizations to their colleagues.",
      "The Cavender Cares Ambassadors are the heart of Cavender Cares and involve the company in a deeper perception of the philanthropic branch. Many successful, profitable businesses deliver monetary donations to non-profit organizations in the community. Cavender Auto Group is setting the tone of community partnerships by digging deeper into the problem local organizations are facing. Incorporating in-kind donations; volunteer hours, supplies and branded items, Cavender Auto Group is driving into the community and changing the perception of the auto industry to the outside world.",
      "As the Cavender family has always said: before a company does well, they must do good.",
    ],
  },
  contact: {
    line: "For more information please contact Sid Aguirre: saguirre@cavenderauto.com",
  },
};
