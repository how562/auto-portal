import type { CMSSection } from "./cmsSectionModel";
import { parseSettings, settingString } from "./cmsSettings";

export const SECTION_DESIGN_KEYS = [
  "background_color",
  "background_image_url",
  "padding_top",
  "padding_bottom",
  "margin_top",
  "margin_bottom",
  "layout_variant",
] as const;

export type SectionSpacingToken = "none" | "compact" | "default" | "spacious";

export const SPACING_OPTIONS: { value: SectionSpacingToken; label: string }[] = [
  { value: "none", label: "None" },
  { value: "compact", label: "Compact" },
  { value: "default", label: "Default" },
  { value: "spacious", label: "Spacious" },
];

export const BACKGROUND_PRESETS: { value: string; label: string }[] = [
  { value: "", label: "Theme default (cream)" },
  { value: "#f7f4ef", label: "Cream" },
  { value: "#ffffff", label: "White" },
  { value: "#1e3556", label: "Charcoal" },
  { value: "#0c1628", label: "Navy deep" },
  { value: "#ebe6de", label: "Cream dark" },
];

const PADDING_CLASS: Record<SectionSpacingToken, string> = {
  none: "py-0",
  compact: "py-10 sm:py-12",
  default: "py-16 sm:py-24",
  spacious: "py-20 sm:py-28 lg:py-32",
};

const MARGIN_CLASS: Record<SectionSpacingToken, { top: string; bottom: string }> = {
  none: { top: "", bottom: "" },
  compact: { top: "mt-4", bottom: "mb-4" },
  default: { top: "mt-0", bottom: "mb-0" },
  spacious: { top: "mt-8", bottom: "mb-8" },
};

function spacingToken(raw: string, fallback: SectionSpacingToken): SectionSpacingToken {
  if (
    raw === "none" ||
    raw === "compact" ||
    raw === "default" ||
    raw === "spacious"
  ) {
    return raw;
  }
  return fallback;
}

export interface ResolvedSectionDesign {
  className: string;
  style: Record<string, string | number | undefined>;
  hasBgImage: boolean;
  isDarkBg: boolean;
}

export function resolveSectionDesign(section: CMSSection): ResolvedSectionDesign {
  const s = parseSettings(section.settings);
  const bg =
    settingString(s, "background_color") ||
    (typeof s.background_color === "string" ? s.background_color : "");
  const bgImage = settingString(s, "background_image_url");
  const padTop = spacingToken(settingString(s, "padding_top"), "default");
  const padBottom = spacingToken(settingString(s, "padding_bottom"), "default");
  const marginTop = spacingToken(settingString(s, "margin_top"), "none");
  const marginBottom = spacingToken(settingString(s, "margin_bottom"), "none");

  const layoutVariant =
    settingString(s, "layout_variant") || section.layout_variant || "";

  const isDarkBg =
    bg === "#1e3556" ||
    bg === "#0c1628" ||
    bg.toLowerCase() === "var(--charcoal)" ||
    layoutVariant === "dark-band";

  const style: Record<string, string | number | undefined> = {};
  if (bg) style.backgroundColor = bg;
  if (bgImage) {
    style.backgroundImage = `url(${bgImage})`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
  }

  const className = [
    MARGIN_CLASS[marginTop].top,
    MARGIN_CLASS[marginBottom].bottom,
    PADDING_CLASS[padTop],
    padBottom !== padTop ? PADDING_CLASS[padBottom] : "",
    isDarkBg ? "text-white" : "",
    layoutVariant === "full-bleed" ? "px-0" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    className,
    style,
    hasBgImage: Boolean(bgImage),
    isDarkBg,
  };
}

/** Merge design defaults into a starter settings object. */
export function withDesignSettings(
  settings: Record<string, unknown>,
  design?: Partial<Record<(typeof SECTION_DESIGN_KEYS)[number], string>>,
): Record<string, unknown> {
  if (!design) return settings;
  return { ...settings, ...design };
}
