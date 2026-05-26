import type { ReactNode } from "react";
import { PortalFooter } from "@/components/home/PortalFooter";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";

export const dynamic = "force-dynamic";

/**
 * Route layout for /inventory — inherits root layout (globals.css + fonts).
 * Wraps segment in <main> for consistent page chrome with the homepage.
 */
export default async function InventoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <LeadCaptureProvider>
        {children}
        <PortalFooter />
      </LeadCaptureProvider>
    </main>
  );
}
