/** CMS-ready copy for the schedule service page (future service_location_grid preset). */
export interface ScheduleServicePageContent {
  eyebrow: string;
  headline: string;
  body: string;
}

export interface ServiceLocation {
  id: string;
  storeName: string;
  brand: string | null;
  logoUrl: string | null;
  servicePhone: string | null;
  servicePhoneTel: string | null;
  address: string | null;
  scheduleUrl: string | null;
  scheduleAvailable: boolean;
  callAvailable: boolean;
}
