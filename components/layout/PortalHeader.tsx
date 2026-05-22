"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CavenderLogo } from "@/components/brand/CavenderLogo";
import { useLeadCapture } from "@/components/portal/LeadCaptureContext";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PortalHeader() {
  const pathname = usePathname();
  const isInventory = pathname.startsWith("/inventory");
  const { openLead } = useLeadCapture();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[var(--line)]/80 bg-[var(--cream)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[90rem] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <CavenderLogo href="/" size="header" variant="dark" priority />

        <nav className="hidden items-center gap-6 lg:flex">
          {isInventory ? (
            <>
              <Link
                href="/#guided-discovery"
                className="text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                Find My Vehicle
              </Link>
              <span className="text-[13px] font-medium text-[var(--ink)]">
                Inventory
              </span>
              <Link
                href="/#locations"
                className="text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                Locations
              </Link>
              <Link
                href="/#how-it-works"
                className="text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                How It Works
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => scrollToId("guided-discovery")}
                className="text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                Find My Vehicle
              </button>
              <Link
                href="/inventory"
                className="text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                Inventory
              </Link>
              <button
                type="button"
                onClick={() => scrollToId("locations")}
                className="text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                Locations
              </button>
              <button
                type="button"
                onClick={() => scrollToId("how-it-works")}
                className="text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                How It Works
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() =>
              openLead({
                action: "general-shortlist",
                shopperIntent: "Navigation: Get my shortlist",
              })
            }
            className="text-[13px] font-medium text-[var(--ink)] transition hover:text-[var(--gold)]"
          >
            Get Shortlist
          </button>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() =>
              openLead({
                action: "general-shortlist",
                shopperIntent: "Get my shortlist",
              })
            }
            className="hidden rounded-full border border-[var(--line-dark)] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--ink)] sm:inline-flex"
          >
            Get Shortlist
          </button>
          {isInventory ? (
            <Link
              href="/#guided-discovery"
              className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--charcoal)] sm:px-5 sm:py-2.5"
            >
              Start Discovery
            </Link>
          ) : (
            <>
              <Link
                href="/inventory"
                className="hidden rounded-full border border-[var(--line-dark)] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition hover:border-[var(--ink)] sm:inline-flex"
              >
                Browse Inventory
              </Link>
              <button
                type="button"
                onClick={() => scrollToId("guided-discovery")}
                className="rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--charcoal)] sm:px-5 sm:py-2.5"
              >
                Start Discovery
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
