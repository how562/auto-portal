"use client";

import { CMSSectionRenderer } from "@/components/cms/CMSSectionRenderer";
import type { EnrichedCMSSection } from "@/lib/cmsSectionModel";

interface CmsDebugSectionPreviewProps {
  section: EnrichedCMSSection;
  label: string;
}

export function CmsDebugSectionPreview({
  section,
  label,
}: CmsDebugSectionPreviewProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-violet-300 bg-[var(--cream)]">
      <div className="border-b border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-violet-900">
        Render preview — {label}
      </div>
      <div className="overflow-hidden">
        <CMSSectionRenderer sections={[section]} />
      </div>
    </div>
  );
}
