import type { Locale } from "./i18n/types";
import { pickLocalizedString, localizeSettings } from "./cmsSectionI18n";
import type { CMSSection } from "./cmsSectionModel";
import { parseSettings, settingString } from "./cmsSettings";

/** Resolved copy for renderers (canonical fields only). */
export interface SectionCopy {
  eyebrow: string;
  headline: string;
  subheadline: string;
  body: string;
  imageUrl: string;
  ctaText: string;
  ctaUrl: string;
}

export function localizeCMSSection(section: CMSSection, locale: Locale): CMSSection {
  if (locale !== "es") return section;

  return {
    ...section,
    headline: pickLocalizedString(section.headline_es, section.headline) ?? section.headline,
    subheadline:
      pickLocalizedString(section.subheadline_es, section.subheadline) ??
      section.subheadline,
    body: pickLocalizedString(section.body_es, section.body) ?? section.body,
    cta_text: pickLocalizedString(section.cta_text_es, section.cta_text) ?? section.cta_text,
    image_url:
      pickLocalizedString(section.image_url_es, section.image_url) ?? section.image_url,
    settings: localizeSettings(section.settings, locale),
  };
}

export function localizeCMSSections(
  sections: CMSSection[],
  locale: Locale,
): CMSSection[] {
  return sections.map((s) => localizeCMSSection(s, locale));
}

export function getSectionCopy(section: CMSSection): SectionCopy {
  const settings = parseSettings(section.settings);

  return {
    eyebrow: section.eyebrow?.trim() || settingString(settings, "eyebrow"),
    headline: section.headline?.trim() || settingString(settings, "headline"),
    subheadline:
      section.subheadline?.trim() || settingString(settings, "subheadline"),
    body: section.body?.trim() || settingString(settings, "body"),
    imageUrl:
      section.image_url?.trim() || settingString(settings, "image_url"),
    ctaText: section.cta_text?.trim() || settingString(settings, "cta_text"),
    ctaUrl: section.cta_url?.trim() || settingString(settings, "cta_url"),
  };
}

export function sectionHasVisibleCopy(copy: SectionCopy): boolean {
  return Boolean(
    copy.eyebrow ||
      copy.headline ||
      copy.subheadline ||
      copy.body ||
      copy.imageUrl ||
      copy.ctaText,
  );
}

/** image_text / split layouts: media on left vs right (incl. video_right). */
export function resolveImageTextMediaSide(
  section: Pick<CMSSection, "layout_variant" | "settings">,
): "left" | "right" {
  const s = parseSettings(section.settings);
  const layout = settingString(s, "layout") || section.layout_variant || "";
  if (
    layout === "image_left" ||
    layout === "video_left" ||
    layout.includes("_left")
  ) {
    return "left";
  }
  if (
    layout === "image_right" ||
    layout === "video_right" ||
    layout.includes("_right")
  ) {
    return "right";
  }
  const pos = settingString(s, "image_position");
  if (pos === "left" || pos === "right") return pos;
  return "right";
}
