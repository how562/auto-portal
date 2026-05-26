import { SectionEyebrow } from "@/components/section-showcase/primitives/SectionEyebrow";
import { SectionShell } from "@/components/section-showcase/primitives/SectionShell";
import { GalleryGrid } from "./GalleryGrid";
import type { GalleryLayoutMeta } from "./types";

export function PresetGallerySection({
  meta,
  devLabel,
}: {
  meta: GalleryLayoutMeta;
  devLabel: string;
}) {
  return (
    <SectionShell pad="tight" className="bg-white" devLabel={devLabel}>
      <header className="mb-8 sm:mb-10">
        <SectionEyebrow className="mb-3">Gallery layout</SectionEyebrow>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
          {meta.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          {meta.description}
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[var(--muted)]">
          layout_variant: {meta.variant} · {meta.image_count} images
        </p>
      </header>
      <GalleryGrid layout={meta.variant} count={meta.image_count} />
    </SectionShell>
  );
}
