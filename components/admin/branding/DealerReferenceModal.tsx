"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { DealerBrandReference } from "@/lib/brandingHub";

interface DealerReferenceModalProps {
  dealer: DealerBrandReference | null;
  onClose: () => void;
}

export function DealerReferenceModal({ dealer, onClose }: DealerReferenceModalProps) {
  useEffect(() => {
    if (!dealer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [dealer, onClose]);

  if (!dealer) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dealer-ref-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--ink)]/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative max-h-[min(90vh,640px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--line)] bg-white shadow-lg">
        <div className="border-b border-[var(--line)] px-6 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            Dealership / OEM reference
          </p>
          <h2 id="dealer-ref-title" className="mt-2 text-xl font-semibold tracking-tight">
            {dealer.storeName}
          </h2>
          <p className="mt-1 text-sm text-[var(--gold)]">{dealer.oem}</p>
        </div>
        <dl className="space-y-5 px-6 py-5 text-sm">
          <div>
            <dt className="font-semibold text-[var(--ink)]">Basic rules</dt>
            <dd className="mt-1 leading-relaxed text-[var(--muted)]">{dealer.basicRules}</dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ink)]">Compliance notes</dt>
            <dd className="mt-1 leading-relaxed text-[var(--muted)]">
              {dealer.complianceNotes}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ink)]">Required ad elements</dt>
            <dd className="mt-1 leading-relaxed text-[var(--muted)]">
              {dealer.requiredAdElements}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ink)]">Required disclaimers</dt>
            <dd className="mt-1 leading-relaxed text-[var(--muted)]">
              {dealer.requiredDisclaimerNotes}
            </dd>
          </div>
          <div>
            <dt className="font-semibold text-[var(--ink)]">Known restrictions</dt>
            <dd className="mt-1 leading-relaxed text-[var(--muted)]">
              {dealer.knownRestrictions}
            </dd>
          </div>
        </dl>
        <div className="border-t border-[var(--line)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-[var(--ink)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
