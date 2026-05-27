import type { ReactNode } from "react";
import type { ExecutiveValueIcon } from "@/lib/executiveTeamPageContent";

function IconShell({ children }: { children: ReactNode }) {
  return (
    <span className="executive-team-values__icon" aria-hidden>
      {children}
    </span>
  );
}

export function ExecutiveValueIcon({ type }: { type: ExecutiveValueIcon }) {
  switch (type) {
    case "integrity":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          </svg>
        </IconShell>
      );
    case "teamwork":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="8" r="2.5" />
            <circle cx="16" cy="9" r="2" />
            <path d="M4 18c0-2.5 2.2-4.5 5-4.5M14 18c0-2 1.8-3.5 4-3.5" strokeLinecap="round" />
          </svg>
        </IconShell>
      );
    case "excellence":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l2.4 4.8 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.6l5.4-.8L12 2z" />
          </svg>
        </IconShell>
      );
    case "community":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
          </svg>
        </IconShell>
      );
  }
}
