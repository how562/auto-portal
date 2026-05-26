"use client";

import Link from "next/link";
import { SectionWireframe } from "@/components/admin/SectionWireframe";
import {
  listPageBuilderPickerGroups,
  matchesAddingTarget,
  type PageBuilderAddTarget,
  type PageBuilderPresetPickerEntry,
} from "@/lib/pageBuilderLibrary";
import type { CMSSectionType } from "@/lib/cmsTypes";
import { btnPrimaryMd, btnSecondaryMd } from "@/lib/buttonClasses";

interface SectionLibraryPickerProps {
  onAdd?: (target: PageBuilderAddTarget) => void;
  addingTarget?: PageBuilderAddTarget | null;
  compact?: boolean;
  showLibraryLink?: boolean;
}

function visibilityBadge(visibility: PageBuilderPresetPickerEntry["library_visibility"]) {
  if (visibility === "hidden") {
    return (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-900">
        Advanced
      </span>
    );
  }
  if (visibility === "merge_into") {
    return (
      <span className="rounded bg-[var(--line)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--muted)]">
        Variant
      </span>
    );
  }
  return null;
}

function SectionPickerCard({
  entry,
  compact,
  onAdd,
  adding,
}: {
  entry: PageBuilderPresetPickerEntry;
  compact?: boolean;
  onAdd?: () => void;
  adding?: boolean;
}) {
  const wireframeType = entry.wireframe_type as CMSSectionType;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-[var(--line-dark)] bg-white transition hover:border-[var(--ink)]/25">
      <SectionWireframe
        type={wireframeType}
        className="rounded-none border-0 border-b border-[var(--line)]"
      />
      <div className={compact ? "flex flex-1 flex-col gap-2 p-3" : "space-y-3 p-4"}>
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="font-semibold tracking-tight text-[var(--ink)]">
              {entry.display_name}
            </h3>
            {visibilityBadge(entry.library_visibility)}
          </div>
          <p className="mt-0.5 font-mono text-[10px] text-[var(--muted)]">{entry.preset_key}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{entry.description}</p>
        </div>
        {!compact ? (
          <>
            <p className="text-xs leading-relaxed text-[var(--ink)]/80">{entry.best_use_case}</p>
            <ul className="flex flex-wrap gap-1">
              {entry.supported_fields.slice(0, 4).map((f) => (
                <li
                  key={f}
                  className="rounded bg-[var(--cream-dark)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--ink)]"
                >
                  {f}
                </li>
              ))}
              {entry.supported_fields.length > 4 ? (
                <li className="text-[9px] text-[var(--muted)]">
                  +{entry.supported_fields.length - 4}
                </li>
              ) : null}
            </ul>
          </>
        ) : null}
        {onAdd ? (
          <button
            type="button"
            disabled={adding}
            onClick={onAdd}
            className={`${btnPrimaryMd} mt-auto w-full justify-center text-xs disabled:opacity-60`}
          >
            {adding ? "Adding…" : "Add"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function SectionLibraryPicker({
  onAdd,
  addingTarget = null,
  compact = false,
  showLibraryLink = true,
}: SectionLibraryPickerProps) {
  const groups = listPageBuilderPickerGroups();
  const totalPresets = groups
    .filter((g) => g.id !== "site_integrations")
    .reduce((n, g) => n + g.presets.length, 0);

  return (
    <div className="space-y-6">
      {showLibraryLink ? (
        <p className="text-sm text-[var(--muted)]">
          {totalPresets} layout presets organized by library category, plus site integrations.{" "}
          <Link
            href="/admin/section-showcase"
            className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Visual catalog
          </Link>
          {" · "}
          <Link
            href="/admin/section-library"
            className="font-medium text-[var(--ink)] underline-offset-2 hover:underline"
          >
            Starters reference
          </Link>
        </p>
      ) : null}

      {groups.map((group) => (
        <section key={group.id} className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
              {group.label}
            </h3>
            <p className="mt-0.5 text-xs text-[var(--muted)]">{group.description}</p>
          </div>
          <div
            className={
              compact
                ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            }
          >
            {group.presets.map((entry) => {
              const target: PageBuilderAddTarget =
                group.id === "site_integrations"
                  ? { kind: "utility", type: entry.preset_key as "inventory_collection" }
                  : { kind: "preset", presetKey: entry.preset_key };

              return (
                <SectionPickerCard
                  key={`${group.id}-${entry.preset_key}`}
                  entry={entry}
                  compact={compact}
                  onAdd={onAdd ? () => onAdd(target) : undefined}
                  adding={matchesAddingTarget(addingTarget, entry.preset_key)}
                />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
