import { COMMUNITY_HERO_FALLBACK, resolveHeroImageSlots } from "./communityHeroFallback";
import { parseCommunityHeroVideoSettings } from "./communityHeroVideo";
import type {
  CommunityHeroButton,
  CommunityHeroContent,
  CommunityHeroHeadlineLine,
  CommunityHeroImagePosition,
  CommunityHeroImageSlot,
} from "./communityHeroTypes";
import { HERO_IMAGE_POSITIONS } from "./communityHeroTypes";
import { parseSettings, settingItems, settingString } from "./cmsSettings";
import type { PageSection } from "./cmsTypes";

const POSITION_ALIASES: Record<string, CommunityHeroImagePosition> = {
  top_left: "top_left",
  "top-left": "top_left",
  right_tall: "right_tall",
  "right-tall": "right_tall",
  center_small: "center_small",
  "center-small": "center_small",
  bottom_wide: "bottom_wide",
  "bottom-wide": "bottom_wide",
};

function normalizePosition(value: string): CommunityHeroImagePosition | null {
  return POSITION_ALIASES[value.trim().toLowerCase()] ?? null;
}

export function parseHeadlineLines(
  headline: string,
  settings: Record<string, unknown> = {},
): CommunityHeroHeadlineLine[] {
  const fromSettings = settingItems<{ text?: string; muted?: boolean }>(
    settings,
    "headline_lines",
  ).filter((line) => line.text?.trim());

  if (fromSettings.length > 0) {
    return fromSettings.map((line, index) => ({
      text: line.text!.trim(),
      muted:
        line.muted === true ||
        (line.muted !== false &&
          fromSettings.length >= 3 &&
          index === fromSettings.length - 1),
    }));
  }

  const lines = headline
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  return lines.map((text, index) => ({
    text,
    muted: lines.length >= 3 && index === lines.length - 1,
  }));
}

function parseButtons(
  settings: Record<string, unknown>,
  section: Pick<PageSection, "cta_text" | "cta_url">,
): CommunityHeroButton[] {
  const fromSettings = settingItems<{ label?: string; url?: string; variant?: string }>(
    settings,
    "buttons",
  ).filter((btn) => btn.label?.trim() && btn.url?.trim());

  if (fromSettings.length > 0) {
    return fromSettings.map((btn, index) => ({
      label: btn.label!.trim(),
      url: btn.url!.trim(),
      variant:
        btn.variant === "primary" || btn.variant === "secondary"
          ? btn.variant
          : index === 0
            ? "primary"
            : "secondary",
    }));
  }

  const label = section.cta_text ?? "";
  const url = section.cta_url ?? "";
  if (label.trim() && url.trim()) {
    return [{ label: label.trim(), url: url.trim(), variant: "primary" }];
  }

  return [];
}

function parseImages(settings: Record<string, unknown>): CommunityHeroImageSlot[] {
  const fromSettings = settingItems<{
    position?: string;
    url?: string;
    image_url?: string;
    alt?: string;
  }>(settings, "images");

  const byPosition = new Map<CommunityHeroImagePosition, CommunityHeroImageSlot>();

  for (const item of fromSettings) {
    if (!item.position) continue;
    const position = normalizePosition(item.position);
    if (!position) continue;
    const url = (item.url ?? item.image_url)?.trim();
    byPosition.set(position, {
      position,
      url: url || undefined,
      alt: item.alt?.trim() || undefined,
    });
  }

  return resolveHeroImageSlots(
    HERO_IMAGE_POSITIONS.map(
      (position) => byPosition.get(position) ?? { position },
    ),
  );
}

export function parseCommunityHeroFromPageSection(
  section: PageSection,
): CommunityHeroContent | null {
  if (section.section_type !== "community_hero") return null;

  const settings = parseSettings(section.settings);

  const headline =
    section.headline ?? settingString(settings, "headline") ?? "";

  const subheadline =
    section.subheadline ?? settingString(settings, "subheadline") ?? "";

  const body =
    section.body ?? settingString(settings, "body") ?? subheadline;

  const headlineLines = parseHeadlineLines(headline, settings);
  const buttons = parseButtons(settings, section);
  const images = parseImages(settings);

  if (headlineLines.length === 0 && !body.trim() && buttons.length === 0) {
    return null;
  }

  const eyebrowLabel =
    section.eyebrow ?? settingString(settings, "eyebrow") ?? "";

  const eyebrowUrl =
    settingString(settings, "eyebrow_url") ||
    settingString(settings, "eyebrow_href") ||
    "";

  const video = parseCommunityHeroVideoSettings(settings);
  if (!video.posterImage.trim() && images[0]?.url) {
    video.posterImage = images[0].url;
  }

  return {
    eyebrow: { label: eyebrowLabel, url: eyebrowUrl },
    headlineLines:
      headlineLines.length > 0
        ? headlineLines
        : COMMUNITY_HERO_FALLBACK.headlineLines,
    subheadline,
    body: body.trim() || COMMUNITY_HERO_FALLBACK.body,
    buttons: buttons.length > 0 ? buttons : COMMUNITY_HERO_FALLBACK.buttons,
    images,
    video,
    pageSection: section,
  };
}
