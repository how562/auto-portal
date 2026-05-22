"use client";

import Link from "next/link";
import { useCta } from "@/components/cta/CtaProvider";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";
import {
  btnPrimaryLg,
  btnPrimarySm,
  btnSecondaryLg,
  btnSecondarySm,
} from "@/lib/buttonClasses";

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
  const discoveryPrimary = useCta("discovery_primary");
  const discoveryBrowse = useCta("discovery_browse");
  const getShortlist = useCta("get_my_shortlist");

  const primary = size === "compact" ? btnPrimarySm : btnPrimaryLg;
  const secondary = size === "compact" ? btnSecondarySm : btnSecondaryLg;
  const browseHref = discoveryBrowse.url ?? "/inventory";

  return (
    <div
      className={`flex gap-3 ${
        layout === "stack" ? "flex-col sm:flex-row" : "flex-wrap items-center"
      }`}
    >
      <button type="button" onClick={scrollToGuided} className={primary}>
        {discoveryPrimary.label}
      </button>
      {showBrowse ? (
        <Link href={browseHref} className={secondary}>
          {discoveryBrowse.label}
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
        {getShortlist.label}
      </button>
    </div>
  );
}
