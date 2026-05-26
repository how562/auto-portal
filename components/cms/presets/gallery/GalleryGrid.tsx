import { PlaceholderImage } from "@/components/section-showcase/primitives/PlaceholderImage";
import type { GalleryLayoutVariant } from "./types";

const LAYOUT_ROOT_CLASS: Record<GalleryLayoutVariant, string> = {
  bento: "gallery-layout-bento",
  uniform: "gallery-layout-uniform",
  featured_lead: "gallery-layout-featured",
  rhythm_rows: "gallery-layout-rhythm",
  dual_collage: "gallery-layout-dual-collage",
};

const BENTO_TILES = [
  "gallery-bento-tile gallery-bento-tile-1",
  "gallery-bento-tile gallery-bento-tile-2",
  "gallery-bento-tile gallery-bento-tile-3",
  "gallery-bento-tile gallery-bento-tile-4",
  "gallery-bento-tile gallery-bento-tile-5",
  "gallery-bento-tile gallery-bento-tile-6",
  "gallery-bento-tile gallery-bento-tile-7",
  "gallery-bento-tile gallery-bento-tile-8",
] as const;

const FEATURED_TILES = [
  "gallery-featured-tile gallery-featured-lead",
  "gallery-featured-tile gallery-featured-tile-2",
  "gallery-featured-tile gallery-featured-tile-3",
  "gallery-featured-tile gallery-featured-tile-4",
  "gallery-featured-tile gallery-featured-tile-5",
  "gallery-featured-tile gallery-featured-tile-6",
  "gallery-featured-tile gallery-featured-tile-7",
  "gallery-featured-tile gallery-featured-tile-8",
] as const;

const RHYTHM_GROUPS = [
  ["gallery-rhythm-tile gallery-rhythm-a", "gallery-rhythm-tile gallery-rhythm-b", "gallery-rhythm-tile gallery-rhythm-c"],
  ["gallery-rhythm-tile gallery-rhythm-d", "gallery-rhythm-tile gallery-rhythm-e"],
  ["gallery-rhythm-tile gallery-rhythm-f", "gallery-rhythm-tile gallery-rhythm-g", "gallery-rhythm-tile gallery-rhythm-h"],
] as const;

function GalleryTile({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <PlaceholderImage label={label} fill />
    </div>
  );
}

function DualCollageHalf({ prefix }: { prefix: "L" | "R" }) {
  const tiles = [
    { cls: "hero-collage-tile-a min-h-[9rem] sm:min-h-[10rem]", label: `${prefix}1` },
    { cls: "hero-collage-tile-b", label: `${prefix}2` },
    { cls: "hero-collage-tile-c min-h-[8rem] sm:min-h-[9rem]", label: `${prefix}3` },
    { cls: "hero-collage-tile-d min-h-[7rem] sm:min-h-[8rem]", label: `${prefix}4` },
  ] as const;

  return (
    <div className="hero-collage-grid min-h-[18rem] sm:min-h-[22rem] lg:min-h-[24rem]">
      {tiles.map((t) => (
        <div key={t.label} className={`hero-collage-tile ${t.cls}`}>
          <PlaceholderImage label={t.label} fill />
        </div>
      ))}
    </div>
  );
}

export function GalleryGrid({
  layout,
  count = 8,
}: {
  layout: GalleryLayoutVariant;
  count?: number;
}) {
  const root = LAYOUT_ROOT_CLASS[layout];

  if (layout === "dual_collage") {
    return (
      <div className={`${root} w-full`}>
        <DualCollageHalf prefix="L" />
        <DualCollageHalf prefix="R" />
      </div>
    );
  }

  if (layout === "rhythm_rows") {
    let n = 0;
    return (
      <div className={`${root} w-full`}>
        {RHYTHM_GROUPS.map((row, rowIndex) => (
          <div key={rowIndex} className="gallery-rhythm-row">
            {row.map((cls) => {
              n += 1;
              if (n > count) return null;
              return <GalleryTile key={cls} className={cls} label={`Image ${n}`} />;
            })}
          </div>
        ))}
      </div>
    );
  }

  if (layout === "featured_lead") {
    return (
      <div className={`${root} w-full`}>
        {FEATURED_TILES.slice(0, count).map((cls, index) => (
          <GalleryTile key={cls} className={cls} label={index === 0 ? "Featured" : `Image ${index + 1}`} />
        ))}
      </div>
    );
  }

  if (layout === "uniform") {
    return (
      <div className={`${root} w-full`}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="gallery-uniform-tile">
            <PlaceholderImage label={`Image ${i + 1}`} aspect="video" fill />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${root} w-full`}>
      {BENTO_TILES.slice(0, count).map((cls, index) => (
        <GalleryTile key={cls} className={cls} label={`Image ${index + 1}`} />
      ))}
    </div>
  );
}
