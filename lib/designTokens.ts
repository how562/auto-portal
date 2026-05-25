/**
 * Centralized design token catalog.
 * Color values are defined once in app/globals.css (:root). This file maps semantic
 * names to CSS variables only — no duplicate hex palette.
 *
 * Update :root in globals.css to apply changes site-wide (Branding page, admin, portal).
 * Optional future: admin UI can write back to globals.css or a theme table.
 *
 * Do not create duplicate palettes. Map brand-approved colors to an existing token or add a
 * clearly named token in :root.
 */

/** Shown on the Branding page — tokens vs brand reference values. */
export const DESIGN_TOKEN_BRAND_CLARIFICATION = [
  "Global design tokens control the portal UI theme and are displayed here as the current source of truth. Brand reference values may match these tokens, but tokens should be treated as system-level UI values unless explicitly marked as brand-approved colors.",
  "Do not create duplicate palettes. If a brand-approved color is needed, map it intentionally to an existing token or add a clearly named token.",
] as const;

export type ColorTokenKey =
  | "background"
  | "backgroundMuted"
  | "surface"
  | "primary"
  | "secondary"
  | "text"
  | "textMuted"
  | "accent"
  | "accentSoft"
  | "border"
  | "borderStrong";

export interface ColorToken {
  key: ColorTokenKey;
  /** CSS custom property on :root (e.g. --cream). */
  cssVar: string;
  label: string;
  usage: string;
  /** Suggested Tailwind utility when using theme extension (e.g. bg-cream). */
  tailwindBg?: string;
  tailwindText?: string;
}

export interface FontToken {
  key: "heading" | "body";
  label: string;
  family: string;
  tailwindClass: string;
  usage: string;
}

export interface RadiusToken {
  key: string;
  cssVar: string;
  label: string;
}

export interface ShadowToken {
  key: string;
  cssVar: string;
  label: string;
}

/** Semantic color tokens → global CSS variables (:root). */
export const colorTokens: ColorToken[] = [
  {
    key: "background",
    cssVar: "--cream",
    label: "Background",
    usage: "Page backgrounds, admin shell, soft sections",
    tailwindBg: "bg-cream",
  },
  {
    key: "backgroundMuted",
    cssVar: "--cream-dark",
    label: "Background (muted)",
    usage: "Cards, hover states, secondary panels",
    tailwindBg: "bg-cream-dark",
  },
  {
    key: "surface",
    cssVar: "--surface",
    label: "Surface",
    usage: "Cards, modals, inputs on cream backgrounds",
    tailwindBg: "bg-surface",
  },
  {
    key: "primary",
    cssVar: "--ink",
    label: "Primary",
    usage: "Primary text, buttons, key UI chrome",
    tailwindBg: "bg-ink",
    tailwindText: "text-ink",
  },
  {
    key: "secondary",
    cssVar: "--charcoal",
    label: "Secondary",
    usage: "Dark panels, hero bands, inverted sections",
    tailwindBg: "bg-charcoal",
  },
  {
    key: "text",
    cssVar: "--ink",
    label: "Text",
    usage: "Headlines and primary body copy",
    tailwindText: "text-ink",
  },
  {
    key: "textMuted",
    cssVar: "--muted",
    label: "Text (muted)",
    usage: "Captions, helper text, metadata",
    tailwindText: "text-muted",
  },
  {
    key: "accent",
    cssVar: "--gold",
    label: "Accent",
    usage: "Eyebrows, highlights, premium accents",
    tailwindBg: "bg-gold",
    tailwindText: "text-gold",
  },
  {
    key: "accentSoft",
    cssVar: "--gold-soft",
    label: "Accent (soft)",
    usage: "Soft gold highlights on dark backgrounds",
    tailwindText: "text-gold-soft",
  },
  {
    key: "border",
    cssVar: "--line",
    label: "Border",
    usage: "Default borders and dividers",
  },
  {
    key: "borderStrong",
    cssVar: "--line-dark",
    label: "Border (strong)",
    usage: "Emphasized borders, dashed outlines",
  },
];

export const fontTokens: FontToken[] = [
  {
    key: "heading",
    label: "Heading",
    family: "Gopadel",
    tailwindClass: "font-sans",
    usage: "Display and section headlines (inherits from html :root)",
  },
  {
    key: "body",
    label: "Body",
    family: "Gopadel",
    tailwindClass: "font-sans",
    usage: "Body copy, UI labels, buttons (same stack as headings)",
  },
];

export const radiusTokens: RadiusToken[] = [
  { key: "sm", cssVar: "--radius-sm", label: "Radius SM" },
  { key: "md", cssVar: "--radius-md", label: "Radius MD" },
  { key: "lg", cssVar: "--radius-lg", label: "Radius LG" },
];

export const shadowTokens: ShadowToken[] = [
  { key: "tight", cssVar: "--shadow-tight", label: "Shadow tight" },
  { key: "card", cssVar: "--shadow-card", label: "Shadow card" },
];

export const designTokens = {
  colors: colorTokens,
  fonts: fontTokens,
  radius: radiusTokens,
  shadows: shadowTokens,
} as const;

/** Reference string for stylesheets and arbitrary Tailwind values. */
export function cssVarReference(cssVar: string): string {
  return `var(${cssVar})`;
}

/** All color CSS variables used by the branding color panel. */
export const BRAND_COLOR_CSS_VARS = Array.from(
  new Set(colorTokens.map((t) => t.cssVar)),
);
