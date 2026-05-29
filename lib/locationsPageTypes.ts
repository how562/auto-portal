import type { DealershipCmsEntry, DealershipDepartmentContact } from "@/lib/dealershipDirectoryTypes";
import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

export interface LocationsPageFeature {
  id: string;
  title: string;
  description: string;
  icon: "pin" | "clock" | "handshake" | "community";
}

export interface LocationsPageContent {
  header?: PageHeaderConfig;
  hero: {
    kicker: string;
    title: string;
    tagline: string;
    imageUrl: string;
  };
  map: {
    eyebrow: string;
    headline: string;
    paragraphs: string[];
    ctaLabel: string;
  };
  help: {
    headline: string;
    body: string;
    features: LocationsPageFeature[];
  };
  /** Per-dealership copy, imagery, and department contacts. */
  dealerships: DealershipCmsEntry[];
}

export interface DealershipLocation {
  id: string;
  number: number;
  storeName: string;
  addressLine1: string;
  addressLine2: string | null;
  viewUrl: string;
  imageUrl: string;
  /** Percentage position on the illustrated map panel. */
  mapPosition: { top: string; left: string };
  /** Show on inset Texas map (e.g. DFW / Rockwall). */
  showOnInset?: boolean;
  viewCtaLabel?: string;
  departments?: DealershipDepartmentContact[];
}
