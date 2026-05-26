export interface ProcessStepItem {
  id: string;
  step: number;
  title: string;
  body: string;
}

export interface TimelineEventItem {
  id: string;
  date: string;
  title: string;
  body: string;
}

export const SHOWCASE_PROCESS_STEPS: ProcessStepItem[] = [
  {
    id: "p1",
    step: 1,
    title: "Discover",
    body: "Share how you drive — budget, timing, and must-haves — online or in store.",
  },
  {
    id: "p2",
    step: 2,
    title: "Compare",
    body: "Review curated matches with transparent pricing and trade-in estimates.",
  },
  {
    id: "p3",
    step: 3,
    title: "Experience",
    body: "Schedule test drives at your preferred location with a dedicated specialist.",
  },
  {
    id: "p4",
    step: 4,
    title: "Deliver",
    body: "Finalize paperwork, protection plans, and schedule delivery or pickup.",
  },
];

export const SHOWCASE_TIMELINE: TimelineEventItem[] = [
  {
    id: "e1",
    date: "1998",
    title: "First store opens",
    body: "A single showroom rooted in transparent, community-first retail.",
  },
  {
    id: "e2",
    date: "2008",
    title: "Service expansion",
    body: "Factory-trained technicians and dedicated service lanes region-wide.",
  },
  {
    id: "e3",
    date: "2018",
    title: "Digital discovery",
    body: "Guided online matching connects guests to real inventory before they visit.",
  },
  {
    id: "e4",
    date: "Today",
    title: "12 locations",
    body: "Coastal and inland stores united under one guest experience standard.",
  },
];
