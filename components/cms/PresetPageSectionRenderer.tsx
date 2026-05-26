"use client";

import {
  PresetCardGridValues,
  PresetContactSplit,
  PresetCtaBanner,
  PresetDirectionsPanel,
  PresetFaqAccordion,
  PresetFeatureBand,
  PresetFormCompact,
  PresetFormLead,
  PresetGallerySection,
  PresetImageText,
  PresetLocationGrid,
  PresetLocationSplitMap,
  PresetMapMultiLocation,
  PresetMemoSimple,
  PresetMemoTitled,
  PresetMixedMediaStory,
  PresetPageHeaderCard,
  PresetPageHeaderCompact,
  PresetPageHeaderDarkBand,
  PresetPageHeaderImageBanner,
  PresetPageHeaderMinimal,
  PresetProcessHorizontal,
  PresetProcessVertical,
  PresetReviewsGrid,
  PresetReviewsSummary,
  PresetSplitHero,
  PresetStaffByDepartment,
  PresetStaffGrid,
  PresetStaffListCompact,
  PresetStaffLocationTabs,
  PresetStaffSpotlight,
  PresetTestimonialFeatured,
  PresetTestimonialGrid,
  PresetTextImageEditorial,
  PresetTextIntro,
  PresetTimelineHorizontal,
  PresetTimelineVertical,
  PresetVideoGallery,
  PresetVideoHero,
  PresetVideoTextSplit,
} from "@/components/cms/presets";
import { GALLERY_LAYOUT_VARIANTS } from "@/components/cms/presets/gallery/types";
import type { PresetSectionCopy } from "@/components/cms/presets/shared/PresetSectionIntro";
import type { CMSSection, EnrichedCMSSection } from "@/lib/cmsSectionModel";
import { getPresetByKey } from "@/lib/savedSectionPresets";
function toPresetCopy(section: CMSSection): PresetSectionCopy {
  return {
    eyebrow: section.eyebrow ?? undefined,
    headline: section.headline ?? undefined,
    body: section.body ?? section.subheadline ?? undefined,
  };
}

const GALLERY_PRESET_KEYS: Record<string, (typeof GALLERY_LAYOUT_VARIANTS)[number]["variant"]> = {
  gallery_bento: "bento",
  gallery_uniform: "uniform",
  gallery_featured_lead: "featured_lead",
  gallery_rhythm_rows: "rhythm_rows",
  gallery_dual_collage: "dual_collage",
};

interface PresetPageSectionRendererProps {
  section: EnrichedCMSSection;
  presetKey: string;
}

export function PresetPageSectionRenderer({
  section,
  presetKey,
}: PresetPageSectionRendererProps) {
  const entry = getPresetByKey(presetKey);
  const copy = toPresetCopy(section);
  const label = entry?.display_name ?? presetKey;

  const galleryVariant = GALLERY_PRESET_KEYS[presetKey];
  if (galleryVariant) {
    const meta = GALLERY_LAYOUT_VARIANTS.find((m) => m.variant === galleryVariant);
    if (meta) {
      return <PresetGallerySection meta={meta} devLabel={label} />;
    }
  }

  switch (presetKey) {
    case "split_hero":
      return <PresetSplitHero devLabel={label} />;
    case "page_header_card":
      return <PresetPageHeaderCard devLabel={label} />;
    case "page_header_compact":
      return <PresetPageHeaderCompact devLabel={label} />;
    case "page_header_dark_band":
      return <PresetPageHeaderDarkBand devLabel={label} />;
    case "page_header_image_banner":
      return <PresetPageHeaderImageBanner devLabel={label} />;
    case "page_header_minimal":
      return <PresetPageHeaderMinimal devLabel={label} />;
    case "text_intro":
      return <PresetTextIntro devLabel={label} />;
    case "image_text":
      return <PresetImageText devLabel={label} />;
    case "text_image_editorial":
      return <PresetTextImageEditorial devLabel={label} />;
    case "mixed_media_story":
      return <PresetMixedMediaStory devLabel={label} />;
    case "card_grid_values":
      return <PresetCardGridValues devLabel={label} />;
    case "faq_accordion":
      return <PresetFaqAccordion devLabel={label} />;
    case "video_hero":
      return <PresetVideoHero copy={copy} devLabel={label} />;
    case "video_text_split":
      return <PresetVideoTextSplit devLabel={label} />;
    case "video_gallery":
      return <PresetVideoGallery copy={copy} devLabel={label} />;
    case "cta_banner":
      return <PresetCtaBanner devLabel={label} />;
    case "feature_band":
      return <PresetFeatureBand devLabel={label} />;
    case "contact_split":
      return <PresetContactSplit devLabel={label} />;
    case "form_lead":
      return <PresetFormLead devLabel={label} />;
    case "form_compact":
      return <PresetFormCompact devLabel={label} />;
    case "testimonial_grid":
      return <PresetTestimonialGrid copy={copy} devLabel={label} />;
    case "testimonial_featured":
      return <PresetTestimonialFeatured copy={copy} devLabel={label} />;
    case "reviews_summary":
      return <PresetReviewsSummary copy={copy} devLabel={label} />;
    case "reviews_grid":
      return <PresetReviewsGrid copy={copy} devLabel={label} />;
    case "process_horizontal":
      return <PresetProcessHorizontal copy={copy} devLabel={label} />;
    case "process_vertical":
      return <PresetProcessVertical copy={copy} devLabel={label} />;
    case "timeline_vertical":
      return <PresetTimelineVertical copy={copy} devLabel={label} />;
    case "timeline_horizontal":
      return <PresetTimelineHorizontal copy={copy} devLabel={label} />;
    case "location_grid":
      return <PresetLocationGrid copy={copy} devLabel={label} />;
    case "location_split_map":
      return <PresetLocationSplitMap copy={copy} devLabel={label} />;
    case "map_multi_location":
      return <PresetMapMultiLocation copy={copy} devLabel={label} />;
    case "directions_panel":
      return <PresetDirectionsPanel copy={copy} devLabel={label} />;
    case "staff_grid":
      return <PresetStaffGrid devLabel={label} />;
    case "staff_by_department":
      return <PresetStaffByDepartment devLabel={label} />;
    case "staff_spotlight":
      return <PresetStaffSpotlight devLabel={label} />;
    case "staff_list_compact":
      return <PresetStaffListCompact devLabel={label} />;
    case "staff_location_tabs":
      return <PresetStaffLocationTabs devLabel={label} />;
    case "memo_simple":
      return <PresetMemoSimple devLabel={label} />;
    case "memo_titled":
      return <PresetMemoTitled devLabel={label} />;
    default:
      return (
        <div className="portal-container py-12 text-center text-sm text-[var(--muted)]">
          Unknown preset: {presetKey}
        </div>
      );
  }
}
