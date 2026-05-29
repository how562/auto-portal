export const PAGE_HEADER_TYPES = [
  "none",
  "cinematic",
  "editorial",
  "split",
  "utility",
  "magazine",
] as const;

export type PageHeaderType = (typeof PAGE_HEADER_TYPES)[number];

export interface PageHeaderButtonFields {
  primaryButtonLabel: string;
  primaryButtonUrl: string;
  secondaryButtonLabel: string;
  secondaryButtonUrl: string;
}

export interface CinematicPageHeaderFields extends PageHeaderButtonFields {
  eyebrow: string;
  title: string;
  subtitle: string;
  backgroundImage: string;
  mobileBackgroundImage: string;
  /** 0–100 */
  overlayOpacity: number;
  /** Optional brand mark (e.g. Cavender Cares / Commitment) */
  logoImageUrl: string;
  logoAlt: string;
}

/** 50/50 feature opener — cream copy left, photography right (Contact, About-style). */
export interface SplitFeaturePageHeaderFields {
  eyebrow: string;
  title: string;
  /** Second headline line — receives gold brushstroke accent. */
  titleLine2: string;
  introText: string;
  signatureText: string;
  image: string;
  imageAlt: string;
}

export interface EditorialPageHeaderFields {
  eyebrow: string;
  title: string;
  /** Right-column supporting statement (magazine spread). */
  introText: string;
  signatureText: string;
  /** Optional labels below the spread (e.g. chapter topics). */
  categoryLabels: string[];
  /** Legacy — not rendered in editorial spread; use page body sections for photography. */
  image: string;
  imageAlt: string;
  primaryButtonLabel: string;
  primaryButtonUrl: string;
}

export interface UtilityPageHeaderFields extends PageHeaderButtonFields {
  eyebrow: string;
  title: string;
  introText: string;
  supportPoints: string[];
  formSlot: string;
  toolSlot: string;
  vehicleImage: string;
  vehicleImageAlt: string;
}

export interface MagazineCategoryLink {
  label: string;
  href: string;
}

export interface MagazinePageHeaderFields {
  logoUrl: string;
  logoText: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  categoryLinks: MagazineCategoryLink[];
  darkMode: boolean;
}

export type PageHeaderConfig =
  | { type: "none" }
  | { type: "cinematic"; cinematic: CinematicPageHeaderFields }
  | { type: "editorial"; editorial: EditorialPageHeaderFields }
  | { type: "split"; split: SplitFeaturePageHeaderFields }
  | { type: "utility"; utility: UtilityPageHeaderFields }
  | { type: "magazine"; magazine: MagazinePageHeaderFields };

/** Pages that use the shared header system */
export type PageHeaderSlug =
  | "about-us"
  | "executive-team"
  | "careers"
  | "locations"
  | "schedule-service"
  | "finance-center"
  | "value-your-trade"
  | "cavender-commitment"
  | "cavender-cares"
  | "contact-the-cavenders"
  | "our-story"
  | "stories";

export const RECOMMENDED_PAGE_HEADER_TYPE: Record<PageHeaderSlug, PageHeaderType> = {
  "about-us": "split",
  "executive-team": "editorial",
  careers: "editorial",
  locations: "utility",
  "schedule-service": "utility",
  "finance-center": "utility",
  "value-your-trade": "utility",
  "cavender-commitment": "cinematic",
  "cavender-cares": "cinematic",
  "contact-the-cavenders": "split",
  "our-story": "magazine",
  stories: "magazine",
};

export const PAGE_HEADER_IMAGE_HINTS = {
  cinematicDesktop: "1920×720",
  cinematicMobile: "768×900",
  editorialImage: "1200×900",
  splitFeature: "1200×900 — portrait or editorial crop, rounded in layout",
  utilityVehicle: "1200×700 transparent PNG/WebP preferred",
  magazineLogo: "SVG or transparent PNG preferred",
} as const;

export function emptyCinematicHeader(): CinematicPageHeaderFields {
  return {
    eyebrow: "",
    title: "",
    subtitle: "",
    backgroundImage: "",
    mobileBackgroundImage: "",
    overlayOpacity: 45,
    primaryButtonLabel: "",
    primaryButtonUrl: "",
    secondaryButtonLabel: "",
    secondaryButtonUrl: "",
    logoImageUrl: "",
    logoAlt: "",
  };
}

export function emptySplitHeader(): SplitFeaturePageHeaderFields {
  return {
    eyebrow: "",
    title: "",
    titleLine2: "",
    introText: "",
    signatureText: "",
    image: "",
    imageAlt: "",
  };
}

export function emptyEditorialHeader(): EditorialPageHeaderFields {
  return {
    eyebrow: "",
    title: "",
    introText: "",
    signatureText: "",
    categoryLabels: [],
    image: "",
    imageAlt: "",
    primaryButtonLabel: "",
    primaryButtonUrl: "",
  };
}

export function emptyUtilityHeader(): UtilityPageHeaderFields {
  return {
    eyebrow: "",
    title: "",
    introText: "",
    supportPoints: [],
    formSlot: "",
    toolSlot: "",
    vehicleImage: "",
    vehicleImageAlt: "",
    primaryButtonLabel: "",
    primaryButtonUrl: "",
    secondaryButtonLabel: "",
    secondaryButtonUrl: "",
  };
}

export function emptyMagazineHeader(): MagazinePageHeaderFields {
  return {
    logoUrl: "",
    logoText: "",
    eyebrow: "",
    title: "",
    subtitle: "",
    categoryLinks: [],
    darkMode: true,
  };
}

export function defaultHeaderForType(type: PageHeaderType): PageHeaderConfig {
  switch (type) {
    case "cinematic":
      return { type: "cinematic", cinematic: emptyCinematicHeader() };
    case "editorial":
      return { type: "editorial", editorial: emptyEditorialHeader() };
    case "split":
      return { type: "split", split: emptySplitHeader() };
    case "utility":
      return { type: "utility", utility: emptyUtilityHeader() };
    case "magazine":
      return { type: "magazine", magazine: emptyMagazineHeader() };
    default:
      return { type: "none" };
  }
}
