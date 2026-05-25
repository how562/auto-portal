import { GROUP_LOGO_SRC, DEALER_BRAND_REFERENCES } from "@/lib/brandingHub";
import type { BrandingCmsBundle } from "@/lib/brandingCmsTypes";
import { hexToRgb } from "@/lib/brandingCmsUtils";

/** Initial brand-reference swatches (portal theme values live in globals.css). */
const REFERENCE_COLORS = [
  { name: "Ink", token_name: "--ink", hex: "#152a47", category: "primary", usage_note: "Primary text and UI chrome. Linked global token — edit globals.css for portal theme." },
  { name: "Charcoal", token_name: "--charcoal", hex: "#1e3556", category: "secondary", usage_note: "Dark panels and hero bands." },
  { name: "Cream", token_name: "--cream", hex: "#f7f4ef", category: "neutral", usage_note: "Page background." },
  { name: "Gold", token_name: "--gold", hex: "#b8956b", category: "accent", usage_note: "Accent highlights and eyebrows." },
  { name: "Muted", token_name: "--muted", hex: "#6b6560", category: "neutral", usage_note: "Supporting copy." },
] as const;

const NOW = "1970-01-01T00:00:00.000Z";

function fallbackId(prefix: string, index: number): string {
  return `fallback-${prefix}-${index}`;
}

/** Static demo data when Supabase tables are empty — not a second source of truth. */
export function getBrandingCmsFallbackBundle(): BrandingCmsBundle {
  return {
    source: "fallback",
    logos: [
      {
        id: fallbackId("logo", 0),
        name: "Cavender Auto Group — Primary",
        logo_type: "primary",
        variant: "any",
        file_url: GROUP_LOGO_SRC,
        alt_text: "Cavender Auto Group",
        usage_notes: "Default group mark on light backgrounds.",
        sort_order: 0,
        is_active: true,
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    colors: REFERENCE_COLORS.map((c, index) => ({
      id: fallbackId("color", index),
      name: c.name,
      token_name: c.token_name,
      hex: c.hex,
      rgb: hexToRgb(c.hex),
      usage_note: c.usage_note,
      category: c.category,
      sort_order: index,
      is_active: true,
      created_at: NOW,
      updated_at: NOW,
    })),
    typography: [
      {
        id: fallbackId("type", 0),
        font_role: "heading",
        font_family: "Gopadel",
        fallback_stack: "system-ui, sans-serif",
        font_weights: "600, 700",
        usage_notes: "Display and section headlines.",
        example_preview: "Guided discovery across our network.",
        sort_order: 0,
        is_active: true,
        created_at: NOW,
        updated_at: NOW,
      },
      {
        id: fallbackId("type", 1),
        font_role: "body",
        font_family: "Gopadel",
        fallback_stack: "system-ui, sans-serif",
        font_weights: "400, 500",
        usage_notes: "Body copy and UI labels.",
        example_preview: "Find your next vehicle by how you live.",
        sort_order: 1,
        is_active: true,
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    messaging: [
      {
        id: fallbackId("msg", 0),
        title: "Brand voice",
        category: "voice",
        body: "Confident, community-minded, and clear — Cavender Auto Group first on group materials.",
        usage_notes: "Group-wide campaigns and portal copy.",
        applies_to: "group-wide",
        dealership_name: null,
        oem: null,
        sort_order: 0,
        is_active: true,
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    disclaimers: [
      {
        id: fallbackId("disc", 0),
        title: "General pricing disclaimer",
        disclaimer_type: "general",
        body: "Unless specifically itemized, advertised prices exclude state and local taxes, title, license, registration fees, dealer documentary fee of $225, and finance charges, if applicable.",
        applies_to: "group-wide",
        dealership_name: null,
        oem: null,
        is_required: true,
        effective_date: null,
        expiration_date: null,
        sort_order: 0,
        is_active: true,
        created_at: NOW,
        updated_at: NOW,
      },
    ],
    dealerReferences: DEALER_BRAND_REFERENCES.map((ref, index) => ({
      id: ref.id.startsWith("fallback") ? ref.id : fallbackId("dealer", index),
      store_name: ref.storeName,
      oem: ref.oem,
      logo_reference_url: null,
      required_ad_elements: ref.requiredAdElements,
      known_restrictions: ref.knownRestrictions,
      compliance_notes: ref.complianceNotes,
      disclaimer_notes: ref.requiredDisclaimerNotes,
      sort_order: index,
      is_active: true,
      created_at: NOW,
      updated_at: NOW,
    })),
  };
}

/** Seed payloads for empty DB tables. */
export function getBrandingCmsSeedPayloads() {
  const bundle = getBrandingCmsFallbackBundle();
  const stripMeta = <T extends { id: string; created_at: string; updated_at: string }>(
    rows: T[],
  ) =>
    rows.map(({ id: _id, created_at: _c, updated_at: _u, ...row }) => row);

  return {
    logos: stripMeta(bundle.logos),
    colors: stripMeta(bundle.colors),
    typography: stripMeta(bundle.typography),
    messaging: stripMeta(bundle.messaging),
    disclaimers: stripMeta(bundle.disclaimers),
    dealerReferences: stripMeta(bundle.dealerReferences),
  };
}
