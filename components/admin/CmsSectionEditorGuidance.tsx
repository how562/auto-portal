import {
  getLibraryEntry,
  isLibrarySectionType,
} from "@/lib/cmsSectionLibrary";
import { getRegistryEntry } from "@/lib/cmsSectionRegistry";
import type { CMSSectionType } from "@/lib/cmsTypes";

interface CmsSectionEditorGuidanceProps {
  sectionType: CMSSectionType;
}

export function CmsSectionEditorGuidance({ sectionType }: CmsSectionEditorGuidanceProps) {
  if (isLibrarySectionType(sectionType)) {
    const entry = getLibraryEntry(sectionType);
    return (
      <GuidanceBlock
        label={entry.label}
        bestUseCase={entry.bestUseCase}
        copyGuidance={entry.copyGuidance}
        imageGuidance={entry.imageGuidance}
        recommendedImageSize={entry.recommendedImageSize}
      />
    );
  }

  const entry = getRegistryEntry(sectionType);
  return (
    <GuidanceBlock
      label={entry.label}
      bestUseCase={entry.description}
      copyGuidance={entry.description}
      imageGuidance={null}
      recommendedImageSize={null}
    />
  );
}

function GuidanceBlock({
  label,
  bestUseCase,
  copyGuidance,
  imageGuidance,
  recommendedImageSize,
}: {
  label: string;
  bestUseCase: string;
  copyGuidance: string;
  imageGuidance: string | null;
  recommendedImageSize: string | null;
}) {

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--cream)]/60 p-4 text-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
        {label} — editing tips
      </p>
      <p className="mt-2 leading-relaxed text-[var(--ink)]/85">{bestUseCase}</p>
      <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
        <span className="font-semibold text-[var(--ink)]">Copy:</span> {copyGuidance}
      </p>
      {imageGuidance ? (
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          <span className="font-semibold text-[var(--ink)]">Image:</span> {imageGuidance}
          {recommendedImageSize ? ` (${recommendedImageSize})` : ""}
        </p>
      ) : null}
    </div>
  );
}
