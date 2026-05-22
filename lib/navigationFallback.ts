import type { FooterNavigation, HeaderNavigation } from "./navigationTypes";

/** Hardcoded header links when Supabase has no active header menu. */
export const FALLBACK_HEADER_NAV: HeaderNavigation = {
  items: [
    {
      id: "fallback-find",
      label: "Find My Vehicle",
      href: "#guided-discovery",
      linkKind: "hash",
    },
    {
      id: "fallback-inventory",
      label: "Inventory",
      href: "/inventory",
      linkKind: "route",
    },
    {
      id: "fallback-locations",
      label: "Locations",
      href: "#locations",
      linkKind: "hash",
    },
    {
      id: "fallback-how",
      label: "How It Works",
      href: "#how-it-works",
      linkKind: "hash",
    },
    {
      id: "fallback-shortlist",
      label: "Get Shortlist",
      action: "general-shortlist",
    },
  ],
};

/** Hardcoded footer columns when Supabase has no active footer menu. */
export const FALLBACK_FOOTER_NAV: FooterNavigation = {
  groups: [
    {
      title: "Discover",
      items: [
        { id: "fb-d1", label: "Find My Vehicle" },
        { id: "fb-d2", label: "Smart Match" },
        { id: "fb-d3", label: "Categories" },
      ],
    },
    {
      title: "Shop",
      items: [
        { id: "fb-s1", label: "Inventory" },
        { id: "fb-s2", label: "Under $30k" },
        { id: "fb-s3", label: "Compare" },
      ],
    },
    {
      title: "Group",
      items: [
        { id: "fb-g1", label: "Locations" },
        { id: "fb-g2", label: "How It Works" },
        { id: "fb-g3", label: "Contact" },
      ],
    },
    {
      title: "Legal",
      items: [
        { id: "fb-l1", label: "Privacy" },
        { id: "fb-l2", label: "Terms" },
        { id: "fb-l3", label: "Accessibility" },
      ],
    },
  ],
};
