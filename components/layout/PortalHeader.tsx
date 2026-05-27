"use client";

import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";

import { CavenderLogo } from "@/components/brand/CavenderLogo";

import { HeaderSpanishLanguageHint } from "@/components/i18n/HeaderSpanishLanguageHint";

import { useLanguage } from "@/components/i18n/LanguageProvider";

import { HeaderNavItems } from "@/components/navigation/HeaderNavItems";

import { usePortalNavigation } from "@/components/navigation/NavigationProvider";

export function PortalHeader() {
  const pathname = usePathname();

  const isHome = pathname === "/";

  const { t } = useLanguage();

  const { header } = usePortalNavigation();

  const [mobileOpen, setMobileOpen] = useState(false);



  useEffect(() => {

    setMobileOpen(false);

  }, [pathname]);



  useEffect(() => {

    if (!mobileOpen) return;

    const prev = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {

      document.body.style.overflow = prev;

    };

  }, [mobileOpen]);



  return (

    <header
      className={`fixed top-0 z-50 w-full border-b ${
        isHome
          ? "homepage-header border-transparent bg-[var(--hp-page)]"
          : "border-[var(--line)] bg-[var(--cream)]"
      }`}
    >

      <div className="mx-auto flex h-[4.125rem] max-w-[90rem] items-center justify-between gap-4 px-4 sm:h-[4.625rem] sm:px-6 lg:px-8">

        <CavenderLogo href="/" size="header" variant="dark" priority />



        <nav

          className="hidden items-center gap-6 lg:flex"

          aria-label="Main navigation"

        >

          <HeaderNavItems items={header.items} variant="desktop" />

        </nav>



        <div className="flex shrink-0 items-center gap-2">

          <HeaderSpanishLanguageHint />

          <button

            type="button"

            onClick={() => setMobileOpen((open) => !open)}

            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--line-dark)] text-[var(--ink)] transition hover:border-[var(--ink)] lg:hidden"

            aria-expanded={mobileOpen}

            aria-controls="mobile-main-nav"

            aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}

          >

            {mobileOpen ? (

              <svg

                className="h-4 w-4"

                viewBox="0 0 24 24"

                fill="none"

                stroke="currentColor"

                strokeWidth="2"

                aria-hidden

              >

                <path d="M6 6l12 12M18 6L6 18" />

              </svg>

            ) : (

              <svg

                className="h-4 w-4"

                viewBox="0 0 24 24"

                fill="none"

                stroke="currentColor"

                strokeWidth="2"

                aria-hidden

              >

                <path d="M4 7h16M4 12h16M4 17h16" />

              </svg>

            )}

          </button>

        </div>

      </div>



      {mobileOpen ? (

        <>

          <button

            type="button"

            className="fixed inset-0 top-[4.125rem] z-40 bg-[var(--ink)]/25 sm:top-[4.625rem] lg:hidden"

            aria-label={t("nav.closeMenu")}

            onClick={() => setMobileOpen(false)}

          />

          <nav

            id="mobile-main-nav"

            className={`absolute inset-x-0 top-full z-50 max-h-[min(70vh,28rem)] overflow-y-auto border-b px-4 py-2 shadow-card lg:hidden ${
              isHome
                ? "border-[var(--hp-line-cool)] bg-[var(--hp-page)]"
                : "border-[var(--line)] bg-[var(--cream)]"
            }`}

            aria-label="Main navigation"

          >

            <HeaderNavItems

              items={header.items}

              variant="mobile"

              onNavigate={() => setMobileOpen(false)}

            />

          </nav>

        </>

      ) : null}

    </header>

  );

}


