import { parseSettings, settingString } from "./cmsSettings";
import type { PageSection } from "./cmsTypes";

export function sectionSettings(section: PageSection): Record<string, unknown> {
  return parseSettings(section.settings);
}

export function sectionLayoutVariant(section: PageSection): string {
  if (section.layout_variant) return section.layout_variant;
  return settingString(sectionSettings(section), "layout_variant");
}

export function sectionEyebrow(section: PageSection): string {
  return (
    section.eyebrow ??
    settingString(sectionSettings(section), "eyebrow")
  );
}

export function sectionHeadline(section: PageSection): string {
  return (
    section.headline ?? settingString(sectionSettings(section), "headline")
  );
}

export function sectionSubheadline(section: PageSection): string {
  return (
    section.subheadline ?? settingString(sectionSettings(section), "subheadline")
  );
}

export function sectionBody(section: PageSection): string {
  return section.body ?? settingString(sectionSettings(section), "body");
}

export function sectionImageUrl(section: PageSection): string {
  return (
    section.image_url ?? settingString(sectionSettings(section), "image_url")
  );
}

export function sectionCtaLabel(section: PageSection): string {
  const s = sectionSettings(section);
  return (
    section.cta_text ??
    (settingString(s, "cta_label") || settingString(s, "cta_text"))
  );
}

export function sectionCtaHref(section: PageSection): string {
  const s = sectionSettings(section);
  return (
    section.cta_url ??
    (settingString(s, "cta_href") || settingString(s, "cta_url", "/inventory"))
  );
}
