"use client";

import { useDiscovery } from "@/components/portal/DiscoveryContext";

export function MobileStickyCTA() {
  const { scrollToGuided } = useDiscovery();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/95 p-3 backdrop-blur-lg md:hidden">
      <button
        type="button"
        onClick={scrollToGuided}
        className="w-full rounded-full bg-[var(--ink)] py-3.5 text-sm font-semibold text-white"
      >
        Start Discovery
      </button>
    </div>
  );
}
