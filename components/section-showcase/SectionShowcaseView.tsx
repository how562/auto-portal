import {
  PresetCardGridValues,
  PresetContactSplit,
  PresetCtaBanner,
  PresetDirectionsPanel,
  PresetFaqAccordion,
  PresetFeatureBand,
  PresetFormCompact,
  PresetFormLead,
  PresetGalleryShowcase,
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
import {
  PRESET_LIBRARY_CATEGORIES,
  SECTION_PRESET_CATALOG,
  getPresetsByCategory,
} from "@/lib/sectionPresetCatalog";
import { ShowcaseGroupLabel } from "./primitives/ShowcaseGroupLabel";

function CategoryShowcase({
  categoryId,
  children,
}: {
  categoryId: (typeof PRESET_LIBRARY_CATEGORIES)[number]["id"];
  children: React.ReactNode;
}) {
  const meta = PRESET_LIBRARY_CATEGORIES.find((c) => c.id === categoryId);
  const presets = getPresetsByCategory(categoryId);
  const hidden = presets.filter((p) => p.library_visibility === "hidden").length;

  if (!meta) return <>{children}</>;

  return (
    <>
      <ShowcaseGroupLabel
        title={meta.label}
        description={`${meta.description} · ${presets.length} preset${presets.length === 1 ? "" : "s"}${hidden ? ` (${hidden} hidden from picker)` : ""}.`}
      />
      {children}
    </>
  );
}

/** Visual preview page — grouped by library category (44 presets). */
export function SectionShowcaseView() {
  const pickerCount = SECTION_PRESET_CATALOG.filter(
    (p) => p.library_visibility === "promoted" || p.library_visibility === "standard",
  ).length;

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      <ShowcaseGroupLabel
        title="Section preset library"
        description={`${SECTION_PRESET_CATALOG.length} saved layouts · ${pickerCount} recommended for the add-section picker. Scroll for visual preview by category.`}
      />

      <CategoryShowcase categoryId="page_headers">
        <PresetSplitHero />
        <PresetPageHeaderCard />
        <PresetPageHeaderCompact />
        <PresetPageHeaderDarkBand />
        <PresetPageHeaderImageBanner />
        <PresetPageHeaderMinimal />
      </CategoryShowcase>

      <CategoryShowcase categoryId="content">
        <PresetTextIntro />
        <PresetImageText />
        <PresetTextImageEditorial />
        <PresetMixedMediaStory />
        <PresetCardGridValues />
        <PresetFaqAccordion />
        <PresetVideoHero />
        <PresetVideoTextSplit />
        <PresetVideoGallery />
      </CategoryShowcase>

      <CategoryShowcase categoryId="galleries">
        <PresetGalleryShowcase />
      </CategoryShowcase>

      <CategoryShowcase categoryId="conversion_cta">
        <PresetFeatureBand />
        <PresetCtaBanner />
      </CategoryShowcase>

      <CategoryShowcase categoryId="forms_contact">
        <PresetContactSplit />
        <PresetFormLead />
        <PresetFormCompact />
      </CategoryShowcase>

      <CategoryShowcase categoryId="social_proof">
        <PresetTestimonialGrid />
        <PresetTestimonialFeatured />
        <PresetReviewsSummary />
        <PresetReviewsGrid />
      </CategoryShowcase>

      <CategoryShowcase categoryId="process_steps">
        <PresetProcessHorizontal />
        <PresetProcessVertical />
        <PresetTimelineVertical />
        <PresetTimelineHorizontal />
      </CategoryShowcase>

      <CategoryShowcase categoryId="locations">
        <PresetLocationGrid />
        <PresetLocationSplitMap />
        <PresetMapMultiLocation />
        <PresetDirectionsPanel />
      </CategoryShowcase>

      <CategoryShowcase categoryId="staff_dynamic">
        <PresetStaffGrid />
        <PresetStaffByDepartment />
        <PresetStaffSpotlight />
        <PresetStaffListCompact />
        <PresetStaffLocationTabs />
      </CategoryShowcase>

      <CategoryShowcase categoryId="memos_notices">
        <PresetMemoSimple />
        <PresetMemoTitled />
      </CategoryShowcase>
    </main>
  );
}
