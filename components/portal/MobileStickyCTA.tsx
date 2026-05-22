"use client";

import { useCta } from "@/components/cta/CtaProvider";
import { useDiscovery } from "@/components/portal/DiscoveryContext";
import { btnBlock, btnPrimaryMd } from "@/lib/buttonClasses";

export function MobileStickyCTA() {
  const { scrollToGuided } = useDiscovery();
  const discoveryPrimary = useCta("discovery_primary");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white p-3 md:hidden">
      <button
        type="button"
        onClick={scrollToGuided}
        className={`${btnBlock} ${btnPrimaryMd}`}
      >
        {discoveryPrimary.label}
      </button>
    </div>
  );
}
