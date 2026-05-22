export type PortalCtaKey =
  | "discovery_primary"
  | "discovery_browse"
  | "discovery_view_all_matches"
  | "get_my_shortlist"
  | "header_shortlist"
  | "footer_shortlist"
  | "footer_discovery_primary"
  | "availability"
  | "build_my_shortlist"
  | "compare_similar"
  | "contact_team"
  | "view_details"
  | "details_link"
  | "shortlist_compact"
  | "save_shortlist"
  | "check_availability"
  | "check_compact"
  | "commitment_learn_more"
  | "commitment_browse_vehicles";

export interface PortalCtaValue {
  label: string;
  labelEs: string | null;
  url: string | null;
}

export type PortalCtaMap = Record<PortalCtaKey, PortalCtaValue>;
