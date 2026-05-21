import Link from "next/link";
import { PortalHeader } from "@/components/layout/PortalHeader";

export default function VehicleNotFound() {
  return (
    <>
      <PortalHeader />
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--cream)] px-4 pt-20 text-center">
        <h1 className="headline-stack text-4xl">Vehicle not found</h1>
        <p className="mt-4 max-w-md text-[var(--muted)]">
          This vehicle may no longer be available. Browse live inventory across
          our group.
        </p>
        <Link
          href="/inventory"
          className="mt-8 rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-semibold text-white"
        >
          Back to Inventory
        </Link>
      </div>
    </>
  );
}
