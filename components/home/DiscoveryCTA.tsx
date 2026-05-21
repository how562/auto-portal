"use client";

import Link from "next/link";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";

interface DiscoveryCTAProps {
  layout?: "row" | "stack";
  size?: "default" | "compact";
  showBrowse?: boolean;
}

export function DiscoveryCTA({
  layout = "row",
  size = "default",
  showBrowse = true,
}: DiscoveryCTAProps) {
  const { scrollToGuided } = useDiscovery();
  const { openLead } = useLeadCapture();

  const primary =
    size === "compact"
      ? "rounded-full bg-[var(--ink)] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[var(--charcoal)]"
      : "rounded-full bg-[var(--ink)] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--charcoal)] hover:shadow-[0_12px_40px_rgba(12,12,12,0.15)]";

  const secondary =
    size === "compact"
      ? "rounded-full border border-[var(--line-dark)] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
      : "rounded-full border border-[var(--line-dark)] bg-white px-7 py-3.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--cream)]";

  const browse =
    size === "compact"
      ? "inline-flex rounded-full border border-[var(--line-dark)] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]"
      : "inline-flex rounded-full border border-[var(--line-dark)] bg-white px-7 py-3.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--cream)]";

  return (
    <div
      className={`flex gap-3 ${
        layout === "stack" ? "flex-col sm:flex-row" : "flex-wrap items-center"
      }`}
    >
      <button type="button" onClick={scrollToGuided} className={primary}>
        Start Discovery
      </button>
      {showBrowse ? (
        <Link href="/inventory" className={browse}>
          Browse Inventory
        </Link>
      ) : null}
      <button
        type="button"
        onClick={() =>
          openLead({
            action: "general-shortlist",
            shopperIntent: "Get my shortlist across the auto group",
          })
        }
        className={secondary}
      >
        Get My Shortlist
      </button>
    </div>
  );
}
