import { validateCmsMediaUpload } from "@/lib/cmsMediaValidation";
import {
  HERO_IMAGE_POSITIONS,
  type CommunityHeroImagePosition,
} from "./communityHeroTypes";

export const HERO_SLOT_LABELS: Record<CommunityHeroImagePosition, string> = {
  top_left: "Top left",
  right_tall: "Right tall",
  center_small: "Center small",
  bottom_wide: "Bottom wide",
};

export const HERO_SLOT_TILE_CLASS: Record<CommunityHeroImagePosition, string> = {
  top_left: "hero-collage-tile-a",
  right_tall: "hero-collage-tile-b",
  center_small: "hero-collage-tile-c",
  bottom_wide: "hero-collage-tile-d",
};

type HeroImageSettingItem = {
  position?: string;
  url?: string;
  image_url?: string;
  alt?: string;
};

export function getHeroImageUrls(
  settings: Record<string, unknown>,
): Record<CommunityHeroImagePosition, string> {
  const raw = settings.images;
  const items = Array.isArray(raw)
    ? (raw.filter((item) => item && typeof item === "object") as HeroImageSettingItem[])
    : [];

  return Object.fromEntries(
    HERO_IMAGE_POSITIONS.map((position) => {
      const item = items.find(
        (img) => img.position?.replace(/-/g, "_") === position,
      );
      const url = (item?.url ?? item?.image_url ?? "").trim();
      return [position, url];
    }),
  ) as Record<CommunityHeroImagePosition, string>;
}

export function buildHeroImagesSettings(
  settings: Record<string, unknown>,
  urls: Record<CommunityHeroImagePosition, string>,
): Record<string, unknown> {
  const raw = settings.images;
  const existing = Array.isArray(raw)
    ? (raw.filter((item) => item && typeof item === "object") as HeroImageSettingItem[])
    : [];
  const byPosition = new Map<string, HeroImageSettingItem>();
  for (const item of existing) {
    if (item.position) byPosition.set(item.position.replace(/-/g, "_"), item);
  }

  const images = HERO_IMAGE_POSITIONS.map((position) => {
    const prev = byPosition.get(position);
    const url = urls[position].trim();
    return {
      position,
      url: url || undefined,
      alt: prev?.alt?.trim() || undefined,
    };
  }).filter((item) => item.url);

  return { ...settings, images };
}

export async function uploadCmsImage(file: File): Promise<string> {
  const validation = validateCmsMediaUpload(file);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/cms-media", {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  const data = (await res.json()) as { file?: { publicUrl: string }; error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? "Upload failed");
  }
  if (!data.file?.publicUrl) {
    throw new Error("Upload did not return a public URL");
  }
  return data.file.publicUrl;
}
