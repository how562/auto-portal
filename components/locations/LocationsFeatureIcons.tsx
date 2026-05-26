import type { ReactNode } from "react";
import type { LocationsPageFeature } from "@/lib/locationsPageTypes";

function IconShell({ children }: { children: ReactNode }) {
  return <span className="locations-help__icon" aria-hidden>{children}</span>;
}

export function LocationsFeatureIcon({
  type,
}: {
  type: LocationsPageFeature["icon"];
}) {
  switch (type) {
    case "pin":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="2.25" />
          </svg>
        </IconShell>
      );
    case "clock":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconShell>
      );
    case "handshake":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              d="M8 12l2 2 4-4M7 16l-1 2M17 16l1 2M4 10h4l2-3 2 3h4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M6 14h12" strokeLinecap="round" />
          </svg>
        </IconShell>
      );
    case "community":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="2.5" />
            <circle cx="15" cy="9" r="2.5" />
            <path d="M5 19c0-2.2 1.8-4 4-4s4 1.8 4 4M11 19c0-2.2 1.8-4 4-4s4 1.8 4 4" />
          </svg>
        </IconShell>
      );
  }
}
