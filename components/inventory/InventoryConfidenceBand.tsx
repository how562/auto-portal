"use client";

import { useLeadCapture } from "@/components/portal/LeadCaptureContext";

export function InventoryConfidenceBand() {
  const { openLead } = useLeadCapture();

  return (
    <div className="rounded-[1.75rem] border border-[var(--line-dark)] bg-white px-6 py-8 sm:px-10 sm:py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
        Personal guidance
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
        Not seeing the right fit?
      </h3>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
        Our team can curate a shortlist across every store—matched to how you
        drive, not just what&apos;s in stock.
      </p>
      <button
        type="button"
        onClick={() =>
          openLead({
            action: "general-shortlist",
            shopperIntent: "SRP: Let us build your shortlist",
          })
        }
        className="mt-6 rounded-full bg-[var(--ink)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--charcoal)] hover:shadow-[0_12px_40px_rgba(12,12,12,0.12)]"
      >
        Let us build your shortlist
      </button>
    </div>
  );
}
