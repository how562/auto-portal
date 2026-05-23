import { parseCommunityHeroFromPageSection } from "./communityHeroParse";
import { COMMUNITY_HERO_FALLBACK } from "./communityHeroFallback";
import { localizePageSection } from "./cmsSectionI18n";
import { createTranslator } from "./i18n/translations";
import type { Locale } from "./i18n/types";
import type { CommunityHeroContent } from "./communityHeroTypes";

/** True when hero matches built-in fallback (CMS may add Spanish fields later). */
export function isFallbackCommunityHero(content: CommunityHeroContent): boolean {
  const fb = COMMUNITY_HERO_FALLBACK;
  if (content.body !== fb.body) return false;
  if (content.headlineLines.length !== fb.headlineLines.length) return false;
  return content.headlineLines.every(
    (line, i) => line.text === fb.headlineLines[i]?.text,
  );
}

function heroContentDiffers(
  a: CommunityHeroContent,
  b: CommunityHeroContent,
): boolean {
  if (a.body !== b.body) return true;
  if (a.subheadline !== b.subheadline) return true;
  if (a.eyebrow.label !== b.eyebrow.label) return true;
  if (a.headlineLines.length !== b.headlineLines.length) return true;
  return a.headlineLines.some(
    (line, i) => line.text !== b.headlineLines[i]?.text,
  );
}

function applyFallbackDictionary(content: CommunityHeroContent): CommunityHeroContent {
  const t = createTranslator("es");
  return {
    ...content,
    eyebrow: content.eyebrow
      ? { ...content.eyebrow, label: t("hero.eyebrow") }
      : content.eyebrow,
    headlineLines: [
      { text: t("hero.headline1"), muted: false },
      { text: t("hero.headline2"), muted: false },
      { text: t("hero.headline3"), muted: true },
    ],
    body: t("hero.body"),
    buttons: content.buttons.map((btn, index) => {
      const fallbackBtn = COMMUNITY_HERO_FALLBACK.buttons[index];
      if (!fallbackBtn || btn.label !== fallbackBtn.label) {
        return btn;
      }
      if (index === 0) {
        return { ...btn, label: t("hero.startJourney") };
      }
      if (btn.label === "Browse Inventory") {
        return { ...btn, label: t("hero.browseInventory") };
      }
      return btn;
    }),
  };
}

/** Localize hero via shared page-section i18n, then fallback dictionary for built-in copy. */
export function localizeCommunityHero(
  content: CommunityHeroContent,
  locale: Locale,
): CommunityHeroContent {
  if (locale === "en") return content;

  if (content.pageSection) {
    const localized = localizePageSection(content.pageSection, "es");
    const english =
      parseCommunityHeroFromPageSection(content.pageSection) ?? content;
    const fromCms = parseCommunityHeroFromPageSection(localized);
    if (fromCms) {
      const resolved = { ...fromCms, pageSection: localized };
      if (
        isFallbackCommunityHero(resolved) &&
        !heroContentDiffers(english, resolved)
      ) {
        return applyFallbackDictionary(resolved);
      }
      return resolved;
    }
  }

  if (!isFallbackCommunityHero(content)) {
    return content;
  }

  return applyFallbackDictionary(content);
}
