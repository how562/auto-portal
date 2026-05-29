import type { DealershipCmsEntry, DealershipDepartmentContact } from "@/lib/dealershipDirectoryTypes";
import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

/** CMS-ready copy for the schedule service page. */
export interface ScheduleServiceFeature {
  id: string;
  title: string;
  description: string;
  icon: "calendar" | "techs" | "quality" | "time" | "support";
}

export interface ScheduleServicePageContent {
  header?: PageHeaderConfig;
  hero: {
    kicker: string;
    title: string;
    tagline: string;
    imageUrl: string;
  };
  intro: {
    headline: string;
    subheadline: string;
  };
  features: ScheduleServiceFeature[];
  /** Per-dealership copy, imagery, and department contacts. */
  dealerships: DealershipCmsEntry[];
}

export interface ServiceLocation {
  id: string;
  storeName: string;
  brand: string | null;
  logoUrl: string | null;
  imageUrl?: string | null;
  servicePhone: string | null;
  servicePhoneTel: string | null;
  address: string | null;
  scheduleUrl: string | null;
  scheduleAvailable: boolean;
  callAvailable: boolean;
  scheduleCtaLabel?: string;
  departments?: DealershipDepartmentContact[];
}
