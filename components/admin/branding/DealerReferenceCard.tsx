"use client";

/** This component reads from global design tokens. Update tokens in globals.css to apply changes site-wide. */

import type { DealerBrandReference } from "@/lib/brandingHub";

interface DealerReferenceCardProps {
  dealer: DealerBrandReference;
  onViewDetails: () => void;
  compact?: boolean;
}

function LogoPlaceholder({ oem }: { oem: string }) {
  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--line-dark)] bg-[var(--cream)] text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]"
      aria-hidden
    >
      {oem
        .split(/[/\s]+/)[0]
        ?.slice(0, 3) ?? "OEM"}
    </div>
  );
}

export function DealerReferenceCard({
  dealer,
  onViewDetails,
  compact = false,
}: DealerReferenceCardProps) {
  return (
    <article className="flex flex-col rounded-xl border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-tight)]">
      <div className="flex items-start gap-3">
        <LogoPlaceholder oem={dealer.oem} />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-snug text-[var(--ink)]">
            {dealer.storeName}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-[var(--gold)]">{dealer.oem}</p>
        </div>
      </div>
      <p
        className={`mt-3 text-xs leading-relaxed text-[var(--muted)] ${
          compact ? "line-clamp-2" : "line-clamp-3"
        }`}
      >
        {dealer.complianceNotes}
      </p>
      {!compact ? (
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)] line-clamp-2">
          <span className="font-medium text-[var(--ink)]">Disclaimers: </span>
          {dealer.requiredDisclaimerNotes}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onViewDetails}
        className="mt-4 text-left text-xs font-semibold text-[var(--ink)] underline-offset-2 hover:underline"
      >
        View details
      </button>
    </article>
  );
}
