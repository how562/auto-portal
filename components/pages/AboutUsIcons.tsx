import type { ReactNode } from "react";
import type { AboutUsFeature, AboutUsValue } from "@/lib/aboutUsPageContent";

function IconShell({ children }: { children: ReactNode }) {
  return (
    <span className="about-us-icon-shell" aria-hidden>
      {children}
    </span>
  );
}

export function AboutUsFeatureIcon({ type }: { type: AboutUsFeature["icon"] }) {
  switch (type) {
    case "honesty":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </IconShell>
      );
    case "customer":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
            <path d="M18 8.5l2 1.5M6 8.5L4 10" strokeLinecap="round" />
          </svg>
        </IconShell>
      );
    case "quality":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l2.4 4.8 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.6l5.4-.8L12 2z" />
          </svg>
        </IconShell>
      );
  }
}

export function AboutUsValueIcon({ type }: { type: AboutUsValue["icon"] }) {
  switch (type) {
    case "integrity":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          </svg>
        </IconShell>
      );
    case "respect":
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
    case "passion":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              d="M12 20.5s-6.5-4.2-8.5-8.2C2.2 9.2 4.2 6 7.5 6c1.8 0 3 1 4.5 2.8C13.5 7 14.7 6 16.5 6 19.8 6 21.8 9.2 20.5 12.3 18.5 16.3 12 20.5 12 20.5z"
              strokeLinejoin="round"
            />
          </svg>
        </IconShell>
      );
    case "community":
      return (
        <IconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 18V8l8-4 8 4v10" strokeLinejoin="round" />
            <path d="M9 18v-6h6v6" strokeLinejoin="round" />
            <path d="M4 18h16" strokeLinecap="round" />
          </svg>
        </IconShell>
      );
  }
}
