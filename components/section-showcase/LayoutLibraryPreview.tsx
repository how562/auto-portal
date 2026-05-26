"use client";

import "@/app/homepage-visual.css";

import { ShowcaseHero } from "@/components/home/ShowcaseHero";
import { COMMUNITY_HERO_FALLBACK } from "@/lib/communityHeroFallback";
import type { LayoutLibraryPresetId } from "@/lib/layoutLibraryPresets";

interface LayoutLibraryPreviewProps {
  layoutId: LayoutLibraryPresetId;
  expanded?: boolean;
}

/**
 * Live preview for saved homepage layout blocks (not CMS page sections).
 */
export function LayoutLibraryPreview({
  layoutId,
  expanded = false,
}: LayoutLibraryPreviewProps) {
  return (
    <div
      className={`overflow-visible rounded-lg border border-[var(--line-dark)] bg-[var(--cream)] ${
        expanded ? "p-2" : "p-1"
      }`}
    >
      <div
        className={`homepage-surface overflow-hidden rounded-md ${
          expanded ? "min-h-[22rem]" : "min-h-[16rem] sm:min-h-[18rem]"
        }`}
      >
        {layoutId === "showcase-hero" ? (
          <ShowcaseHero content={COMMUNITY_HERO_FALLBACK} />
        ) : null}
      </div>
    </div>
  );
}
