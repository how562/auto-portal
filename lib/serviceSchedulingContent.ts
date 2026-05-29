import { DEFAULT_DEALERSHIP_DIRECTORY } from "./dealershipDirectoryContent";
import type { ScheduleServiceFeature } from "./serviceSchedulingTypes";

export const SCHEDULE_SERVICE_PAGE_CONTENT = {
  hero: {
    kicker: "Cavender Auto Group Service",
    title: "Schedule Service",
    tagline:
      "Fast. Easy. Convenient. Schedule service at any of our locations.",
    imageUrl: "/images/hero/dealership.jpg",
  },
  intro: {
    headline: "Choose your location below",
    subheadline: "Select your preferred dealership to schedule service.",
  },
  features: [
    {
      id: "scheduling",
      title: "Easy Scheduling",
      description: "Schedule online anytime, from anywhere.",
      icon: "calendar",
    },
    {
      id: "techs",
      title: "Certified Techs",
      description: "Factory-trained technicians on every visit.",
      icon: "techs",
    },
    {
      id: "quality",
      title: "Quality Service",
      description: "Genuine parts and expert care you can trust.",
      icon: "quality",
    },
    {
      id: "time",
      title: "Save Time",
      description: "Book ahead and skip the wait at the counter.",
      icon: "time",
    },
    {
      id: "support",
      title: "We're Here For You",
      description: "Questions? Call your local service team anytime.",
      icon: "support",
    },
  ] satisfies ScheduleServiceFeature[],
  dealerships: structuredClone(DEFAULT_DEALERSHIP_DIRECTORY),
};

export { serviceLocationImageUrl } from "./dealershipImagery";

