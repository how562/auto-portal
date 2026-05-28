"use client";

import { btnSecondaryMd } from "@/lib/buttonClasses";

export function NotEditableHomepageSectionPanel({
  reason,
  dataSource,
  onClose,
}: {
  reason: string;
  dataSource: string;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        This section needs an editor. It is not editable from the homepage layout screen yet.
      </p>
      <p className="text-sm text-[var(--muted)]">{reason}</p>
      <p className="font-mono text-xs text-[var(--muted)]">Data source: {dataSource}</p>
      <div className="flex justify-end border-t border-[var(--line)] pt-4">
        <button type="button" onClick={onClose} className={btnSecondaryMd}>
          Close
        </button>
      </div>
    </div>
  );
}
