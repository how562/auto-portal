"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

/** Shown on the English site — always in Spanish for Spanish-speaking visitors. */
const SPANISH_HINT_COPY = {
  line1: "¿Hablas español?",
  line2: "Haz clic aquí",
  mobile: "Toca ES para español",
} as const;

/** Homepage header — points to ES on the language toggle. */
export function HeaderSpanishLanguageHint() {
  const { locale } = useLanguage();

  if (locale === "es") {
    return <LanguageToggle />;
  }

  return (
    <div className="header-spanish-hint flex items-end gap-0.5 sm:gap-1.5">
      <LanguageToggle />

      <HandDrawnArrow className="header-spanish-hint__arrow mb-1.5 hidden shrink-0 -scale-x-100 text-[var(--ink)] sm:block" />

      <div className="header-spanish-hint__copy hidden pb-1 text-left sm:block">
        <p className="text-[11px] font-semibold leading-tight text-[var(--ink)]">
          {SPANISH_HINT_COPY.line1}
        </p>
        <p className="text-[10px] font-medium leading-tight text-[var(--gold)]">
          {SPANISH_HINT_COPY.line2}
        </p>
      </div>

      <p className="max-w-[5.5rem] pb-1 text-left text-[9px] font-semibold leading-tight text-[var(--ink)] sm:hidden">
        {SPANISH_HINT_COPY.mobile}
      </p>
    </div>
  );
}

function HandDrawnArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-7 w-14 ${className}`.trim()}
      aria-hidden
    >
      <path
        d="M2 14C10 6 18 4 28 10C34 13 38 12 42 10"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M40 8L46 10L42 14"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 16C8 16 9 17 10 16.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}
