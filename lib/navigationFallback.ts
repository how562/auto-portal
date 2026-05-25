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
      href: "/locations",
      linkKind: "route",
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
        {
          id: "fb-d1",
          label: "Find My Vehicle",
          href: "#guided-discovery",
          linkKind: "hash",
        },
        {
          id: "fb-d2",
          label: "Smart Match",
          href: "#guided-discovery",
          linkKind: "hash",
        },
        {
          id: "fb-d3",
          label: "Categories",
          href: "#categories",
          linkKind: "hash",
        },
      ],
    },
    {
      title: "Shop",
      items: [
        {
          id: "fb-s1",
          label: "Inventory",
          href: "/inventory",
          linkKind: "route",
        },
        {
          id: "fb-s2",
          label: "Under $30k",
          href: "/inventory?budget=under-30k",
          linkKind: "route",
        },
        {
          id: "fb-s3",
          label: "Compare",
          action: "compare",
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          id: "fb-g2",
          label: "How It Works",
          href: "#how-it-works",
          linkKind: "hash",
        },
      ],
    },
    {
      title: "Legal",
      items: [
        {
          id: "fb-l1",
          label: "Privacy",
          href: "/privacy",
          linkKind: "route",
        },
        {
          id: "fb-l2",
          label: "Terms",
          href: "/terms",
          linkKind: "route",
        },
        {
          id: "fb-l3",
          label: "Accessibility",
          href: "/accessibility",
          linkKind: "route",
        },
      ],
    },
  ],
};
