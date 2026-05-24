import type { ReactNode } from "react";
import { PortalFooter } from "@/components/home/PortalFooter";
import { LeadCaptureProvider } from "@/components/portal/LeadCaptureContext";
import { fetchStores } from "@/lib/stores";

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
  const stores = await fetchStores();

  return (
    <main className="min-h-screen">
      <LeadCaptureProvider>
        {children}
        <PortalFooter stores={stores} />
      </LeadCaptureProvider>
    </main>
  );
}
