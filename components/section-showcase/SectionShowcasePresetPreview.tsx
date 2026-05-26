"use client";

import { CMSSectionRenderer } from "@/components/cms/CMSSectionRenderer";
import type { EnrichedCMSSection } from "@/lib/cmsSectionModel";

interface SectionShowcasePresetPreviewProps {
  section: EnrichedCMSSection;
  /** Larger preview for catalog focus mode */
  expanded?: boolean;
}

/**
 * Isolated live preview — no max-height scroll trap; section renders at natural height.
 */
export function SectionShowcasePresetPreview({
  section,
  expanded = false,
}: SectionShowcasePresetPreviewProps) {
  return (
    <div
      className={`overflow-visible rounded-lg border border-[var(--line-dark)] bg-[var(--cream)] ${
        expanded ? "p-2" : "p-1"
      }`}
    >
      <div
        className={`overflow-visible ${
          expanded ? "min-h-[22rem]" : "min-h-[16rem] sm:min-h-[18rem]"
        }`}
      >
        <CMSSectionRenderer sections={[section]} />
      </div>
    </div>
  );
}
