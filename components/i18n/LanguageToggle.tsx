"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import type { Locale } from "@/lib/i18n/types";

const OPTIONS: { id: Locale; labelKey: "lang.en" | "lang.es" }[] = [
  { id: "en", labelKey: "lang.en" },
  { id: "es", labelKey: "lang.es" },
];

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className="inline-flex shrink-0 items-center rounded-md border border-[var(--line-dark)] bg-white p-0.5"
      role="group"
      aria-label={t("lang.toggle")}
    >
      {OPTIONS.map((opt) => {
        const active = locale === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLocale(opt.id)}
            className={`min-w-[2.25rem] rounded-[5px] px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide transition ${
              active
                ? "bg-[var(--ink)] text-white"
                : "text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
            aria-pressed={active}
            aria-label={t(opt.labelKey)}
          >
            {t(opt.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
