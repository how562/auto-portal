import { GALLERY_LAYOUT_VARIANTS } from "./types";
import { PresetGallerySection } from "./PresetGallerySection";

/** All saved gallery layout variants (formerly in progress). */
export function PresetGalleryShowcase() {
  return (
    <>
      {GALLERY_LAYOUT_VARIANTS.map((meta, index) => (
        <PresetGallerySection
          key={meta.variant}
          meta={meta}
          devLabel={`Gallery ${index + 1} — ${meta.title}`}
        />
      ))}
    </>
  );
}
