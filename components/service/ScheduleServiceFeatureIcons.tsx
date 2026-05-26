import type { ReactNode } from "react";
import type { ScheduleServiceFeature } from "@/lib/serviceSchedulingTypes";

function IconShell({ children }: { children: ReactNode }) {
  return <span className="schedule-service-feature-icon" aria-hidden>{children}</span>;
}

export function ScheduleServiceFeatureIcon({
  type,
}: {
  type: ScheduleServiceFeature["icon"];
}) {
  switch (type) {
    case "calendar":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M8 3v4M16 3v4M4 10h16" strokeLinecap="round" />
          </svg>
        </IconShell>
      );
    case "techs":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M6 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" strokeLinecap="round" />
            <path d="M17 8.5l2 1.5M7 8.5L5 10" strokeLinecap="round" />
          </svg>
        </IconShell>
      );
    case "quality":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconShell>
      );
    case "time":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconShell>
      );
    case "support":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              d="M7 11V8a5 5 0 0110 0v3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M6 11h12v8H6z" strokeLinejoin="round" />
          </svg>
        </IconShell>
      );
  }
}
