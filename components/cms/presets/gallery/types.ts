export type GalleryLayoutVariant =
  | "bento"
  | "uniform"
  | "featured_lead"
  | "rhythm_rows"
  | "dual_collage";

export interface GalleryLayoutMeta {
  variant: GalleryLayoutVariant;
  title: string;
  description: string;
  image_count: number;
  recommended_cms_fields: string[];
  default_settings: Record<string, string | number | boolean>;
}

export const GALLERY_LAYOUT_VARIANTS: GalleryLayoutMeta[] = [
  {
    variant: "bento",
    title: "Bento editorial",
    description:
      "Asymmetric mosaic with one anchor tile and varied spans — premium editorial feel.",
    image_count: 8,
    recommended_cms_fields: [
      "eyebrow",
      "headline",
      "body",
      "gallery_images[] (8: url, alt, span optional)",
      "settings.layout_variant: bento",
    ],
    default_settings: { layout_variant: "bento", mobile_columns: 2 },
  },
  {
    variant: "uniform",
    title: "Uniform grid",
    description: "Clean equal tiles — predictable for team photos or store exteriors.",
    image_count: 8,
    recommended_cms_fields: [
      "eyebrow",
      "headline",
      "gallery_images[] (8)",
      "settings.layout_variant: uniform",
    ],
    default_settings: { layout_variant: "uniform", aspect_ratio: "4/3" },
  },
  {
    variant: "featured_lead",
    title: "Featured lead",
    description: "One hero image plus a supporting grid — strong focal point.",
    image_count: 8,
    recommended_cms_fields: [
      "eyebrow",
      "headline",
      "featured_image (url, alt)",
      "gallery_images[] (7)",
      "settings.layout_variant: featured_lead",
    ],
    default_settings: { layout_variant: "featured_lead" },
  },
  {
    variant: "rhythm_rows",
    title: "Rhythm rows",
    description: "Three horizontal bands with different tile counts and heights.",
    image_count: 8,
    recommended_cms_fields: [
      "eyebrow",
      "headline",
      "gallery_images[] (8)",
      "settings.layout_variant: rhythm_rows",
    ],
    default_settings: { layout_variant: "rhythm_rows" },
  },
  {
    variant: "dual_collage",
    title: "Dual collage",
    description: "Two homepage-style four-tile collages — doubles the hero motif.",
    image_count: 8,
    recommended_cms_fields: [
      "eyebrow",
      "headline",
      "collage_left[] (4 positions)",
      "collage_right[] (4 positions)",
      "settings.layout_variant: dual_collage",
    ],
    default_settings: { layout_variant: "dual_collage" },
  },
];
