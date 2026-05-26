/** CMS-ready copy for the schedule service page. */
export interface ScheduleServiceFeature {
  id: string;
  title: string;
  description: string;
  icon: "calendar" | "techs" | "quality" | "time" | "support";
}

export interface ScheduleServicePageContent {
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
}
