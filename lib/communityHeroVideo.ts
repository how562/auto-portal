import type {
  CommunityHeroVideoSettings,
  HomepageHeroLayout,
  HomepageHeroOverlayColor,
} from "./communityHeroTypes";
import { settingBool, settingNumber, settingString } from "./cmsSettings";

export const DEFAULT_HERO_VIDEO_SETTINGS: CommunityHeroVideoSettings = {
  heroLayout: "current",
  videoUrl: "",
  posterImage: "/hero/dealership.jpg",
  overlayColor: "dark",
  overlayOpacity: 0.55,
  showInventorySearchBar: true,
};

function parseHeroLayout(raw: string | undefined): HomepageHeroLayout {
  return raw === "video_fullscreen" ? "video_fullscreen" : "current";
}

function parseOverlayColor(raw: string | undefined): HomepageHeroOverlayColor {
  return raw === "light" ? "light" : "dark";
}

function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_HERO_VIDEO_SETTINGS.overlayOpacity;
  return Math.min(1, Math.max(0, value));
}

export function parseCommunityHeroVideoSettings(
  settings: Record<string, unknown>,
): CommunityHeroVideoSettings {
  const heroLayout = parseHeroLayout(
    settingString(settings, "hero_layout") || settingString(settings, "heroLayout"),
  );

  const rawOpacity =
    settingNumber(settings, "overlay_opacity") ??
    settingNumber(settings, "overlayOpacity");

  const overlayOpacity =
    rawOpacity != null
      ? clampOpacity(rawOpacity > 1 ? rawOpacity / 100 : rawOpacity)
      : DEFAULT_HERO_VIDEO_SETTINGS.overlayOpacity;

  const posterImage =
    settingString(settings, "poster_image") ||
    settingString(settings, "posterImage") ||
    DEFAULT_HERO_VIDEO_SETTINGS.posterImage;

  return {
    heroLayout,
    videoUrl:
      settingString(settings, "video_url") ||
      settingString(settings, "videoUrl") ||
      "",
    posterImage,
    overlayColor: parseOverlayColor(
      settingString(settings, "overlay_color") ||
        settingString(settings, "overlayColor"),
    ),
    overlayOpacity,
    showInventorySearchBar:
      settingBool(settings, "show_inventory_search_bar") ??
      settingBool(settings, "showInventorySearchBar") ??
      DEFAULT_HERO_VIDEO_SETTINGS.showInventorySearchBar,
  };
}

export function communityHeroVideoSettingsToRecord(
  video: CommunityHeroVideoSettings,
): Record<string, unknown> {
  return {
    hero_layout: video.heroLayout,
    video_url: video.videoUrl,
    poster_image: video.posterImage,
    overlay_color: video.overlayColor,
    overlay_opacity: video.overlayOpacity,
    show_inventory_search_bar: video.showInventorySearchBar,
  };
}

export function isVideoFullscreenHero(
  video: CommunityHeroVideoSettings | undefined,
): boolean {
  return video?.heroLayout === "video_fullscreen";
}
