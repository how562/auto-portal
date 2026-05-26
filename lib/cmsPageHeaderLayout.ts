import { parseSettings, settingString } from "./cmsSettings";
import type { EnrichedCMSSection } from "./cmsSectionModel";

export function shouldUsePageHeaderHero(
  section: EnrichedCMSSection,
  pageSlug: string,
  isFirstSection: boolean,
): boolean {
  if (!isFirstSection || section.section_type !== "hero") return false;
  const variant = settingString(parseSettings(section.settings), "variant");
  if (variant === "page_header") return true;
  return pageSlug === "about-us";
}

export function pageUsesHeaderHero(
  sections: EnrichedCMSSection[],
  pageSlug: string,
): boolean {
  const first = sections[0];
  if (!first) return false;
  return shouldUsePageHeaderHero(first, pageSlug, true);
}

export function resolvePageHeaderMedia(
  sections: EnrichedCMSSection[],
  heroIndex: number,
  heroSection: EnrichedCMSSection,
): { bannerUrl?: string; sideImageUrl?: string } {
  const settings = parseSettings(heroSection.settings);
  const bannerFromSettings = settingString(settings, "banner_image_url");
  const sideFromSettings = settingString(settings, "side_image_url");

  let bannerUrl = heroSection.image_url?.trim() || bannerFromSettings || undefined;
  let sideImageUrl = sideFromSettings || undefined;

  for (let i = heroIndex + 1; i < sections.length; i++) {
    const section = sections[i];
    const url = section.image_url?.trim();
    if (!url) continue;
    if (!bannerUrl) bannerUrl = url;
    if (!sideImageUrl && section.section_type === "image_text") {
      sideImageUrl = url;
      break;
    }
  }

  if (!sideImageUrl && bannerUrl) sideImageUrl = bannerUrl;

  return { bannerUrl, sideImageUrl };
}
