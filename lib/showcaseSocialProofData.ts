export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role?: string;
  location?: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  source?: string;
  date?: string;
}

export const SHOWCASE_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "t1",
    quote:
      "The team matched us to the right SUV in one visit — no pressure, just clear answers and a smooth delivery.",
    author: "Jamie L.",
    role: "Coastal flagship guest",
    location: "New sedan purchase",
  },
  {
    id: "t2",
    quote:
      "Service kept us updated by text and had the loaner ready before we arrived. Felt organized start to finish.",
    author: "Chris M.",
    role: "Service customer",
  },
  {
    id: "t3",
    quote:
      "Transparent pricing on trade-in and financing. We knew exactly what we were signing before we sat down.",
    author: "Priya S.",
    role: "Returning family",
    location: "Third vehicle",
  },
];

export const SHOWCASE_REVIEWS: ReviewItem[] = [
  {
    id: "r1",
    rating: 5,
    title: "Outstanding sales experience",
    body: "Knowledgeable specialist, zero runaround, and the truck was prepped early.",
    author: "Alex R.",
    source: "Google",
    date: "Apr 2026",
  },
  {
    id: "r2",
    rating: 5,
    title: "Service team communicates",
    body: "Status updates were timely and the invoice matched the estimate.",
    author: "Morgan T.",
    source: "Google",
    date: "Mar 2026",
  },
  {
    id: "r3",
    rating: 4,
    title: "Great selection",
    body: "Large inventory and helpful comparison between trims.",
    author: "Jordan K.",
    source: "Dealer site",
    date: "Feb 2026",
  },
  {
    id: "r4",
    rating: 5,
    title: "Would recommend",
    body: "Family-friendly process and clear explanation of warranties.",
    author: "Taylor N.",
    source: "Google",
    date: "Jan 2026",
  },
];

export const REVIEW_SUMMARY = {
  average: 4.9,
  count: 1284,
  breakdown: [92, 6, 1, 0, 1] as const,
};
