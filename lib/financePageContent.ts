import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

export type FinanceFeatureIconType =
  | "application"
  | "locations"
  | "flexible"
  | "support";

export interface FinanceDealerCard {
  id: string;
  name: string;
  cityRegion: string;
  imageUrl: string;
  applyUrl: string;
  buttonLabel: string;
}

export interface FinancePageFeature {
  id: string;
  title: string;
  description: string;
  icon: FinanceFeatureIconType;
}

export interface FinancePageContent {
  header?: PageHeaderConfig;
  hero: {
    title: string;
    subtitle: string;
    supportingLine: string;
    imageUrl: string;
  };
  intro: {
    eyebrow: string;
    heading: string;
    body: string;
  };
  dealers: FinanceDealerCard[];
  features: FinancePageFeature[];
  cta: {
    heading: string;
    locationsLabel: string;
    locationsHref: string;
    shopLabel: string;
    shopHref: string;
  };
}

const DEFAULT_DEALER_IMAGE = "/images/hero/dealership.jpg";

export const FINANCE_PAGE_CONTENT: FinancePageContent = {
  hero: {
    title: "Finance Center",
    subtitle: "Apply online with the Cavender dealership that works best for you.",
    supportingLine:
      "Choose your preferred location below to start your secure finance application.",
    imageUrl: "/images/hero/dealership.jpg",
  },
  intro: {
    eyebrow: "Fast. Simple. Secure.",
    heading: "Start your finance application online.",
    body: "Whether you're buying new, pre-owned, or certified pre-owned, our finance teams are here to help you move forward with confidence. Select a Cavender location below to begin.",
  },
  dealers: [
    {
      id: "buick-gmc-north",
      name: "Cavender Buick GMC North",
      cityRegion: "San Antonio, TX",
      imageUrl: DEFAULT_DEALER_IMAGE,
      applyUrl:
        "https://www.cavenderbuickgmc281.com/finance/apply-for-financing/",
      buttonLabel: "Apply for Financing",
    },
    {
      id: "buick-gmc-west",
      name: "Cavender Buick GMC West",
      cityRegion: "San Antonio, TX",
      imageUrl: DEFAULT_DEALER_IMAGE,
      applyUrl:
        "https://www.cavenderbuickgmcwest.com/finance/apply-for-financing/",
      buttonLabel: "Apply for Financing",
    },
    {
      id: "cadillac",
      name: "Cavender Cadillac",
      cityRegion: "San Antonio, TX",
      imageUrl: DEFAULT_DEALER_IMAGE,
      applyUrl: "https://www.cavendercadillac.com/finance/apply-for-financing/",
      buttonLabel: "Apply for Financing",
    },
    {
      id: "chevrolet",
      name: "Cavender Chevrolet",
      cityRegion: "Boerne, TX",
      imageUrl: DEFAULT_DEALER_IMAGE,
      applyUrl: "https://www.cavenderchevrolet.com/finance/apply-for-financing/",
      buttonLabel: "Apply for Financing",
    },
    {
      id: "grande-ford",
      name: "Cavender Grande Ford",
      cityRegion: "San Antonio, TX",
      imageUrl: DEFAULT_DEALER_IMAGE,
      applyUrl:
        "https://www.cavendergrandeford.com/finance/apply-for-financing/",
      buttonLabel: "Apply for Financing",
    },
    {
      id: "nissan-rockwall",
      name: "Cavender Nissan Rockwall",
      cityRegion: "Rockwall, TX",
      imageUrl: DEFAULT_DEALER_IMAGE,
      applyUrl:
        "https://www.cavendernissanrockwall.com/finance/apply-for-financing/",
      buttonLabel: "Apply for Financing",
    },
    {
      id: "nissan-san-marcos",
      name: "Cavender Nissan San Marcos",
      cityRegion: "San Marcos, TX",
      imageUrl: DEFAULT_DEALER_IMAGE,
      applyUrl:
        "https://www.cavendernissansanmarcos.com/finance/apply-for-financing/",
      buttonLabel: "Apply for Financing",
    },
    {
      id: "jaguar-san-antonio",
      name: "Jaguar San Antonio",
      cityRegion: "San Antonio, TX",
      imageUrl: DEFAULT_DEALER_IMAGE,
      applyUrl: "https://www.jaguarsanantonio.com/finance/apply-for-financing/",
      buttonLabel: "Apply for Financing",
    },
    {
      id: "land-rover-san-antonio",
      name: "Land Rover San Antonio",
      cityRegion: "San Antonio, TX",
      imageUrl: DEFAULT_DEALER_IMAGE,
      applyUrl:
        "https://www.landroversanantonio.com/finance/apply-for-financing/",
      buttonLabel: "Apply for Financing",
    },
  ],
  features: [
    {
      id: "application",
      title: "Online Application",
      description: "Start your secure application in minutes from any device.",
      icon: "application",
    },
    {
      id: "locations",
      title: "Multiple Locations",
      description: "Choose the Cavender dealership that fits your needs.",
      icon: "locations",
    },
    {
      id: "flexible",
      title: "Flexible Options",
      description: "New, pre-owned, and certified pre-owned financing available.",
      icon: "flexible",
    },
    {
      id: "support",
      title: "Team Support",
      description: "Local finance specialists ready to help you move forward.",
      icon: "support",
    },
  ],
  cta: {
    heading: "Ready to take the next step?",
    locationsLabel: "View All Locations",
    locationsHref: "/locations",
    shopLabel: "Shop Vehicles",
    shopHref: "/inventory",
  },
};
