/** Editable brand-reference CMS records (not global UI theme tokens). */

export const BRANDING_LOGO_TYPES = [
  "primary",
  "horizontal",
  "stacked",
  "icon",
  "light",
  "dark",
  "reversed",
  "one_color",
  "oem_reference",
] as const;

export const BRANDING_LOGO_VARIANTS = ["any", "light", "dark", "reversed", "one_color"] as const;

export const BRANDING_COLOR_CATEGORIES = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "compliance",
  "oem_reference",
] as const;

export const BRANDING_FONT_ROLES = [
  "heading",
  "body",
  "accent",
  "disclaimer",
] as const;

export const BRANDING_MESSAGING_CATEGORIES = [
  "voice",
  "approved_phrase",
  "do",
  "dont",
  "tagline",
  "boilerplate",
  "store_note",
] as const;

export const BRANDING_DISCLAIMER_TYPES = [
  "general",
  "lease",
  "finance",
  "service",
  "oem_specific",
  "dealership_specific",
] as const;

export const BRANDING_APPLIES_TO = ["group-wide", "dealership", "oem"] as const;

export type BrandingCmsResource =
  | "logos"
  | "colors"
  | "typography"
  | "messaging"
  | "disclaimers"
  | "dealer-references";

export interface BrandingLogoRow {
  id: string;
  name: string;
  logo_type: string;
  variant: string;
  file_url: string;
  alt_text: string | null;
  usage_notes: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandingColorRow {
  id: string;
  name: string;
  token_name: string | null;
  hex: string;
  rgb: string | null;
  usage_note: string | null;
  category: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandingTypographyRow {
  id: string;
  font_role: string;
  font_family: string;
  fallback_stack: string | null;
  font_weights: string | null;
  usage_notes: string | null;
  example_preview: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandingMessagingRow {
  id: string;
  title: string;
  category: string;
  body: string;
  usage_notes: string | null;
  applies_to: string;
  dealership_name: string | null;
  oem: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandingDisclaimerRow {
  id: string;
  title: string;
  disclaimer_type: string;
  body: string;
  applies_to: string;
  dealership_name: string | null;
  oem: string | null;
  is_required: boolean;
  effective_date: string | null;
  expiration_date: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandingDealerReferenceRow {
  id: string;
  store_name: string;
  oem: string;
  logo_reference_url: string | null;
  required_ad_elements: string | null;
  known_restrictions: string | null;
  compliance_notes: string | null;
  disclaimer_notes: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandingCmsBundle {
  logos: BrandingLogoRow[];
  colors: BrandingColorRow[];
  typography: BrandingTypographyRow[];
  messaging: BrandingMessagingRow[];
  disclaimers: BrandingDisclaimerRow[];
  dealerReferences: BrandingDealerReferenceRow[];
  source: "database" | "fallback";
}
