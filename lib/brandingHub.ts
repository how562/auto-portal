import { BRAND_NAME } from "@/lib/brand";

/**
 * Structural rules for the Branding admin page.
 * Cavender Auto Group is the parent brand; dealership/OEM content is compliance reference only.
 */
export const BRANDING_STRUCTURE_RULES = [
  "This page is Cavender Auto Group-first.",
  "Dealership and OEM content is for compliance reference only and must remain secondary.",
  "Do not expand dealership sections into full brand pages.",
  "Do not add dealership-level navigation or tabs.",
  "Do not prioritize dealership content over group brand content.",
  "Keep dealership content in card, modal, or reference format only.",
  "All primary branding decisions (logos, colors, typography, messaging) are defined at the Cavender Auto Group level.",
] as const;

/** Shown at the top of dealership compliance sections (tab + reference cards). */
export const DEALERSHIP_COMPLIANCE_NOTICE =
  "Dealership references are provided for compliance and correct usage only. Cavender Auto Group remains the parent brand standard across this portal.";

export type BrandingTabId =
  | "identity"
  | "logos"
  | "colors"
  | "typography"
  | "messaging"
  | "disclaimers"
  | "dealer-oem-notes";

export interface BrandingTab {
  id: BrandingTabId;
  label: string;
}

export const BRANDING_TABS: BrandingTab[] = [
  { id: "identity", label: "Identity" },
  { id: "logos", label: "Logos" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "messaging", label: "Messaging" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "dealer-oem-notes", label: "Dealership Compliance References" },
];

export interface DealerBrandReference {
  id: string;
  storeName: string;
  oem: string;
  complianceNotes: string;
  requiredDisclaimerNotes: string;
  basicRules: string;
  requiredAdElements: string;
  knownRestrictions: string;
}

/** Static compliance references — merged with live store names when available. */
export const DEALER_BRAND_REFERENCES: DealerBrandReference[] = [
  {
    id: "cavender-buick-gmc-north",
    storeName: "Cavender Buick GMC North",
    oem: "Buick / GMC",
    complianceNotes:
      "Use OEM lockups only with approved co-brand spacing. Do not alter GM brand colors.",
    requiredDisclaimerNotes:
      "Include store legal name and GM attribution on paid media per current OEM ad guidelines.",
    basicRules:
      "Lead with Cavender Auto Group in group campaigns; store name secondary. Buick/GMC marks only on store-specific units.",
    requiredAdElements: "Store name, OEM logo lockup, offer expiration, mileage disclaimer when applicable.",
    knownRestrictions: "No unapproved taglines on GM marks. No competitor OEM assets in shared layouts.",
  },
  {
    id: "cavender-chevrolet",
    storeName: "Cavender Chevrolet",
    oem: "Chevrolet",
    complianceNotes:
      "Chevrolet bowtie and wordmark must follow GM spacing rules. Cavender wordmark precedes store line.",
    requiredDisclaimerNotes:
      "Chevrolet mandatory disclaimers on all price-forward creative. See latest GM ad standards PDF.",
    basicRules:
      "Group voice on cross-store pieces; Chevrolet branding only on Chevrolet store touchpoints.",
    requiredAdElements: "Chevrolet lockup, store URL or phone, pricing disclaimers, APR terms when shown.",
    knownRestrictions: "Do not combine Chevrolet assets with other OEM marks on the same unit.",
  },
  {
    id: "cavender-ford",
    storeName: "Cavender Ford",
    oem: "Ford",
    complianceNotes:
      "Ford oval and script are required on Ford-branded units. Co-brand with Cavender per Ford partner guidelines.",
    requiredDisclaimerNotes:
      "Ford Motor Company attribution and store legal name on broadcast and digital price ads.",
    basicRules:
      "Cavender Auto Group parent brand on group pages; Ford identity on Ford inventory and store ads only.",
    requiredAdElements: "Ford logo, store identification, offer dates, conditional offer language.",
    knownRestrictions: "Ford assets may not be repurposed for non-Ford inventory or service claims.",
  },
  {
    id: "cavender-nissan",
    storeName: "Cavender Nissan",
    oem: "Nissan",
    complianceNotes:
      "Nissan signature and wordmark sizing per Nissan brand standards. Maintain clear space around marks.",
    requiredDisclaimerNotes:
      "Nissan required footers on lease/payment creative. Store DBA must match approved dealer list.",
    basicRules:
      "Group campaigns use Cavender identity; Nissan marks only where Nissan products are featured.",
    requiredAdElements: "Nissan lockup, store contact, payment disclaimers, model year when referenced.",
    knownRestrictions: "No modification of Nissan logotypes. No implied Nissan corporate endorsement.",
  },
  {
    id: "cavender-cadillac",
    storeName: "Cavender Cadillac",
    oem: "Cadillac",
    complianceNotes:
      "Cadillac crest and typography are premium-tier — use approved luxury templates only.",
    requiredDisclaimerNotes:
      "GM/Cadillac disclaimers on all incentive advertising. Match store legal entity to GM roster.",
    basicRules:
      "Elevated tone for Cadillac; Cavender Auto Group remains parent on corporate materials.",
    requiredAdElements: "Cadillac lockup, store name, offer terms, exclusivity language when required.",
    knownRestrictions: "Do not place Cadillac marks on mass-market Cavender group hero assets.",
  },
  {
    id: "cavender-hyundai",
    storeName: "Cavender Hyundai",
    oem: "Hyundai",
    complianceNotes:
      "Hyundai logo placement per HMA dealer advertising standards. Co-brand hierarchy: Cavender → store → Hyundai.",
    requiredDisclaimerNotes:
      "Hyundai factory disclaimers on APR/lease ads. Include store license and contact per HMA checklist.",
    basicRules:
      "Hyundai creative only on Hyundai store channels. Group pages stay Cavender-first.",
    requiredAdElements: "Hyundai logo, store info, warranty/offer disclaimers as applicable.",
    knownRestrictions: "Hyundai assets not permitted on other OEM store listings or co-op templates.",
  },
];

export const GROUP_LOGO_SRC = "/brand/cavender-auto-group.svg";

export const GROUP_IDENTITY = {
  name: BRAND_NAME,
  tagline: "Guided discovery across our dealership network.",
  summary:
    "Cavender Auto Group is the parent brand for all customer-facing digital properties, vendor creative, and internal templates. Dealership and OEM marks are supporting references for compliant local execution — not alternate brand systems.",
  principles: [
    "Lead every group touchpoint with Cavender Auto Group identity.",
    "Use dealership/OEM marks only where a specific store or franchise is represented.",
    "Keep compliance notes visible for vendors — avoid improvised lockups or colors.",
  ],
};

export function mergeDealerReferencesWithStores(
  stores: { id: string; name: string }[],
): DealerBrandReference[] {
  const byName = new Map(
    DEALER_BRAND_REFERENCES.map((ref) => [ref.storeName.toLowerCase(), ref]),
  );
  const used = new Set<string>();
  const merged: DealerBrandReference[] = [];

  for (const store of stores) {
    const key = store.name.trim().toLowerCase();
    const existing = byName.get(key);
    if (existing) {
      merged.push({ ...existing, id: store.id });
      used.add(existing.id);
    } else {
      merged.push({
        id: store.id,
        storeName: store.name,
        oem: "See OEM guidelines",
        complianceNotes:
          "Confirm OEM lockup, spacing, and co-brand rules with the marketing lead for this store.",
        requiredDisclaimerNotes:
          "Use store legal name and current OEM-required disclaimers on all paid media.",
        basicRules:
          "Cavender Auto Group is the parent brand. Store/OEM marks are secondary and store-specific.",
        requiredAdElements:
          "Store name, contact, offer terms, and OEM-mandated disclaimer blocks.",
        knownRestrictions:
          "Do not create standalone mini brand guides per store — reference this hub only.",
      });
    }
  }

  for (const ref of DEALER_BRAND_REFERENCES) {
    if (!used.has(ref.id) && !merged.some((m) => m.id === ref.id)) {
      merged.push(ref);
    }
  }

  return merged.sort((a, b) => a.storeName.localeCompare(b.storeName));
}
