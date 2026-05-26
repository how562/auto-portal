"use client";

import type { CMSSection } from "@/lib/cmsSectionModel";
import { inspectCMSSections } from "@/lib/cmsSectionDebug";

interface CmsSectionDebugPanelProps {
  sections: CMSSection[];
  defaultCollapsed?: boolean;
}

export function CmsSectionDebugPanel({
  sections,
  defaultCollapsed = false,
}: CmsSectionDebugPanelProps) {
  const rows = inspectCMSSections(sections);

  return (
    <details
      className="rounded-2xl border border-[var(--line)] bg-[var(--cream-dark)]/50"
      open={!defaultCollapsed}
    >
      <summary className="cursor-pointer list-none px-4 py-4 sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
          Section debug (field panel)
        </span>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Canonical fields only — expand to inspect raw values.
        </p>
      </summary>
      <div className="space-y-3 border-t border-[var(--line)] px-4 pb-4 sm:px-5 sm:pb-5">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-[var(--line)] bg-white p-3 text-xs"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[var(--ink)]">
                {row.sort_order} · {row.registryLabel}
              </span>
              <code className="rounded bg-[var(--cream)] px-1">{row.section_type}</code>
              {!row.is_active ? (
                <span className="text-amber-700">inactive</span>
              ) : null}
              {row.hasDedicatedRenderer ? (
                <span className="text-emerald-700">renderer</span>
              ) : (
                <span className="text-amber-700">generic fallback</span>
              )}
              {row.hasVisibleCopy ? (
                <span className="text-emerald-700">has copy</span>
              ) : (
                <span className="text-red-600">no copy</span>
              )}
            </div>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {row.fields.map((f) => (
                <li
                  key={f.key}
                  className={f.populated ? "text-[var(--ink)]" : "text-[var(--muted)]"}
                >
                  <span className="font-medium">{f.key}</span>: {f.preview}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}
