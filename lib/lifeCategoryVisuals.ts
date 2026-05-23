import type { LifeCategoryId } from "./lifeFilters";

export interface LifeCategoryPlaceholderStyle {
  /** CSS background for the abstract art layer */
  background: string;
  /** Accent blob color (CSS color) */
  accent: string;
  /** Secondary accent */
  accentMuted: string;
}

const PLACEHOLDERS: Record<LifeCategoryId, LifeCategoryPlaceholderStyle> = {
  family: {
    background:
      "linear-gradient(135deg, #e8e2d8 0%, #d4dce8 45%, #c8d6e4 100%)",
    accent: "rgba(26, 42, 74, 0.12)",
    accentMuted: "rgba(201, 162, 90, 0.2)",
  },
  work: {
    background:
      "linear-gradient(145deg, #ddd8d0 0%, #b8c0c8 50%, #8a949e 100%)",
    accent: "rgba(12, 12, 12, 0.14)",
    accentMuted: "rgba(74, 85, 99, 0.18)",
  },
  luxury: {
    background:
      "linear-gradient(160deg, #1a2234 0%, #2c3548 40%, #4a5568 100%)",
    accent: "rgba(201, 162, 90, 0.35)",
    accentMuted: "rgba(255, 255, 255, 0.08)",
  },
  budget: {
    background:
      "linear-gradient(135deg, #e6ebe4 0%, #d0ddd2 50%, #b8c9bc 100%)",
    accent: "rgba(26, 42, 74, 0.1)",
    accentMuted: "rgba(74, 120, 90, 0.15)",
  },
  "first-vehicle": {
    background:
      "linear-gradient(140deg, #ebe8e2 0%, #d8e0ea 55%, #c5d0e0 100%)",
    accent: "rgba(26, 42, 74, 0.11)",
    accentMuted: "rgba(120, 140, 160, 0.16)",
  },
  "fuel-efficient": {
    background:
      "linear-gradient(150deg, #dce8e4 0%, #b8d4ce 45%, #94b8ae 100%)",
    accent: "rgba(26, 74, 58, 0.12)",
    accentMuted: "rgba(255, 255, 255, 0.2)",
  },
  "weekend-ready": {
    background:
      "linear-gradient(145deg, #e0ddd4 0%, #c4c8b0 40%, #9aa88a 100%)",
    accent: "rgba(42, 58, 42, 0.14)",
    accentMuted: "rgba(26, 42, 74, 0.1)",
  },
  "everyday-drive": {
    background:
      "linear-gradient(135deg, #e8e6e2 0%, #d0d4dc 50%, #b8bec8 100%)",
    accent: "rgba(26, 42, 74, 0.1)",
    accentMuted: "rgba(160, 168, 178, 0.22)",
  },
};

export function getLifeCategoryPlaceholder(
  categoryId: LifeCategoryId,
): LifeCategoryPlaceholderStyle {
  return PLACEHOLDERS[categoryId];
}
