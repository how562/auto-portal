import type { ReactNode } from "react";
import type {
  AboutUsFeature,
  AboutUsPillar,
  AboutUsValue,
} from "@/lib/aboutUsPageContent";

function FeatureIconShell({ children }: { children: ReactNode }) {
  return (
    <span className="about-us-icon-shell about-us-icon-shell--filled" aria-hidden>
      {children}
    </span>
  );
}

function PillarIconShell({ children }: { children: ReactNode }) {
  return (
    <span className="about-us-icon-shell about-us-icon-shell--outline" aria-hidden>
      {children}
    </span>
  );
}

function ValueIconShell({ children }: { children: ReactNode }) {
  return (
    <span className="about-us-icon-shell about-us-icon-shell--value" aria-hidden>
      {children}
    </span>
  );
}

export function AboutUsPillarIcon({ type }: { type: AboutUsPillar["icon"] }) {
  switch (type) {
    case "local_roots":
      return (
        <PillarIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
            <path
              d="M12 3.5c-3.2 1.2-5.5 3.8-6.2 7.2-.3 1.5-.2 3 .3 4.3.8 2 2.5 3.5 4.5 4.2 1.2.4 2.4.4 3.4 0 2-.7 3.7-2.2 4.5-4.2.5-1.3.6-2.8.3-4.3-.7-3.4-3-6-6.2-7.2z"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="11" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </PillarIconShell>
      );
    case "our_people":
      return (
        <PillarIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
            <circle cx="9" cy="8.5" r="2.75" />
            <circle cx="16.5" cy="9.5" r="2.25" />
            <path d="M4.5 18.5c0-2.8 2.2-5 4.5-5s4.5 2.2 4.5 5" strokeLinecap="round" />
            <path d="M14 18.5c0-2.2 1.6-4 3.5-4.2" strokeLinecap="round" />
          </svg>
        </PillarIconShell>
      );
    case "our_promise":
      return (
        <PillarIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
            <path
              d="M7 11.5c0-2.2 1.8-4 4-4s4 1.8 4 4v1.5c0 1.2-.5 2.3-1.3 3.1l-2.7 2.7-2.7-2.7A4.4 4.4 0 017 13V11.5z"
              strokeLinejoin="round"
            />
            <path d="M9.5 11.5h5M9.5 13.5h5" strokeLinecap="round" />
          </svg>
        </PillarIconShell>
      );
  }
}

export function AboutUsFeatureIcon({ type }: { type: AboutUsFeature["icon"] }) {
  switch (type) {
    case "honesty":
      return (
        <FeatureIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8 10.5c0-1.5 1.2-2.8 2.8-2.8h2.4c1.5 0 2.8 1.2 2.8 2.8v1.2c0 1-.4 2-1.1 2.7l-2.1 2.1-2.1-2.1a3.8 3.8 0 01-1.1-2.7v-1.2z" />
            <path d="M9.5 10h5M9.5 11.8h5" strokeLinecap="round" />
          </svg>
        </FeatureIconShell>
      );
    case "customer":
      return (
        <FeatureIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8.5" r="3.25" />
            <path d="M5.5 19.5c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" strokeLinecap="round" />
          </svg>
        </FeatureIconShell>
      );
    case "quality":
      return (
        <FeatureIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </FeatureIconShell>
      );
  }
}

export function AboutUsValueIcon({ type }: { type: AboutUsValue["icon"] }) {
  switch (type) {
    case "integrity":
      return (
        <ValueIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </ValueIconShell>
      );
    case "respect":
      return (
        <ValueIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
            <circle cx="9" cy="8" r="2.5" />
            <circle cx="16" cy="9" r="2" />
            <path d="M4 18c0-2.5 2.2-4.5 5-4.5M14 18c0-2 1.8-3.5 4-3.5" strokeLinecap="round" />
          </svg>
        </ValueIconShell>
      );
    case "excellence":
      return (
        <ValueIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
            <path d="M12 2l2.4 4.8 5.4.8-3.9 3.8.9 5.4L12 14.8 7.2 17l.9-5.4L4.2 7.6l5.4-.8L12 2z" />
          </svg>
        </ValueIconShell>
      );
    case "passion":
      return (
        <ValueIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
            <path d="M9.5 18h5" strokeLinecap="round" />
            <path d="M10 18V11.5a2 2 0 014 0V18" strokeLinecap="round" />
            <path d="M12 4.5v2" strokeLinecap="round" />
            <path
              d="M8.5 7.5c.5-1.5 2-2.5 3.5-2.5s3 1 3.5 2.5"
              strokeLinecap="round"
            />
          </svg>
        </ValueIconShell>
      );
    case "community":
      return (
        <ValueIconShell>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.35">
            <path
              d="M12 20.5s-6.5-4.2-8.5-8.2C2.2 9.2 4.2 6 7.5 6c1.8 0 3 1 4.5 2.8C13.5 7 14.7 6 16.5 6 19.8 6 21.8 9.2 20.5 12.3 18.5 16.3 12 20.5 12 20.5z"
              strokeLinejoin="round"
            />
          </svg>
        </ValueIconShell>
      );
  }
}
