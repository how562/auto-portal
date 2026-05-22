import Link from "next/link";
import { PortalHeader } from "@/components/layout/PortalHeader";
import { DiscoveryProvider } from "@/components/portal/DiscoveryContext";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { brandPageTitle } from "@/lib/brand";

export const metadata = {
  title: brandPageTitle("Page not found"),
};

export default function CMSNotFound() {
  return (
    <DiscoveryProvider>
      <LeadCaptureProvider>
        <PortalHeader />
        <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-4 pt-20 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--gold)]">
            Not found
          </p>
          <h1 className="mt-4 headline-stack text-4xl">
            This page isn&apos;t available
          </h1>
          <p className="mt-4 max-w-md text-[var(--muted)]">
            The page may be unpublished or the link may be incorrect.
          </p>
          <Link
            href="/"
            className="mt-8 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white"
          >
            Back to home
          </Link>
        </main>
      </LeadCaptureProvider>
    </DiscoveryProvider>
  );
}
