import type { ReactNode } from "react";

/**
 * Route layout for /inventory — inherits root layout (globals.css + fonts).
 * Wraps segment in <main> for consistent page chrome with the homepage.
 */
export default function InventoryLayout({ children }: { children: ReactNode }) {
  return <main className="min-h-screen">{children}</main>;
}
