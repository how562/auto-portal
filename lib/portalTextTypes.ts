/** Known portal_text_settings.text_key values (includes dotted keys). */
export type PortalTextKey =
  | "smart_match_eyebrow"
  | "smart_match_title"
  | "smart_match_step_1_title"
  | "smart_match_step_1_body"
  | "smart_match_results_title"
  | "smart_match_results_body"
  | "smart_match_empty"
  | "smart_match_view_all"
  | "homepage.title"
  | "homepage.subtitle"
  | "inventory.title"
  | "discovery.heading";

export interface PortalTextValue {
  labelEn: string;
  labelEs: string | null;
  category: string | null;
}

export type PortalTextMap = Record<string, PortalTextValue>;
