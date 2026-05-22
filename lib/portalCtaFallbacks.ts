import type { PortalCtaMap } from "./portalCtaTypes";

/** Default English labels/URLs when Supabase has no row for a key. */
export const PORTAL_CTA_FALLBACKS: PortalCtaMap = {
  discovery_primary: {
    label: "Start Discovery",
    labelEs: "Comienza tu búsqueda",
    url: "#guided-discovery",
  },
  discovery_browse: {
    label: "Browse Inventory",
    labelEs: "Ver inventario",
    url: "/inventory",
  },
  discovery_view_all_matches: {
    label: "View all matching vehicles",
    labelEs: "Ver todas las opciones",
    url: null,
  },
  get_my_shortlist: {
    label: "Get My Shortlist",
    labelEs: "Te ayudamos a elegir",
    url: null,
  },
  header_shortlist: {
    label: "Get Shortlist",
    labelEs: "Mi lista",
    url: null,
  },
  footer_shortlist: {
    label: "Get My Shortlist",
    labelEs: "Te ayudamos a elegir",
    url: null,
  },
  footer_discovery_primary: {
    label: "Start Discovery",
    labelEs: "Comienza tu búsqueda",
    url: "/#guided-discovery",
  },
  availability: {
    label: "Check Availability",
    labelEs: "Consultar disponibilidad",
    url: null,
  },
  build_my_shortlist: {
    label: "Build My Shortlist",
    labelEs: "Armar mi lista",
    url: null,
  },
  compare_similar: {
    label: "Compare Similar",
    labelEs: "Comparar similares",
    url: null,
  },
  contact_team: {
    label: "Contact our team",
    labelEs: "Habla con nuestro equipo",
    url: null,
  },
  view_details: {
    label: "View details",
    labelEs: "Ver detalles",
    url: null,
  },
  details_link: { label: "Details", labelEs: "Detalles", url: null },
  shortlist_compact: { label: "Shortlist", labelEs: "Lista", url: null },
  save_shortlist: { label: "Save", labelEs: "Guardar", url: null },
  check_availability: {
    label: "Check availability",
    labelEs: "Consultar disponibilidad",
    url: null,
  },
  check_compact: { label: "Check", labelEs: "Consultar", url: null },
  commitment_learn_more: {
    label: "Learn More",
    labelEs: "Conocer más",
    url: "/about",
  },
  commitment_browse_vehicles: {
    label: "See Available Vehicles",
    labelEs: "Ver vehículos disponibles",
    url: "/inventory",
  },
};

export const PORTAL_CTA_KEYS = Object.keys(
  PORTAL_CTA_FALLBACKS,
) as (keyof PortalCtaMap)[];
