"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";

import { CavenderLogo } from "@/components/brand/CavenderLogo";

import { useCta } from "@/components/cta/CtaProvider";

import { HeaderSpanishLanguageHint } from "@/components/i18n/HeaderSpanishLanguageHint";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

import { useLanguage } from "@/components/i18n/LanguageProvider";

import { HeaderNavItems } from "@/components/navigation/HeaderNavItems";

import { usePortalNavigation } from "@/components/navigation/NavigationProvider";

import { useOptionalLeadCapture } from "@/components/portal/LeadCaptureContext";

import { btnPrimarySm, btnSecondarySm } from "@/lib/buttonClasses";



function scrollToId(id: string) {

  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

}



export function PortalHeader() {

  const pathname = usePathname();

  const isHome = pathname === "/";
  const isInventory = pathname.startsWith("/inventory");

  const openLead = useOptionalLeadCapture();

  const { t } = useLanguage();

  const { header } = usePortalNavigation();

  const headerShortlist = useCta("header_shortlist");

  const discoveryPrimary = useCta("discovery_primary");

  const discoveryBrowse = useCta("discovery_browse");

  const [mobileOpen, setMobileOpen] = useState(false);



  const browseHref = discoveryBrowse.url ?? "/inventory";

  function discoveryHrefForPage(): string {
    const url = discoveryPrimary.url;
    if (!url) return isInventory ? "/#guided-discovery" : "#guided-discovery";
    if (url.startsWith("#") && isInventory) {
      return `/${url.replace(/^\//, "")}`;
    }
    return url;
  }

  const discoveryHref = discoveryHrefForPage();



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

          {isHome ? (
            <HeaderSpanishLanguageHint />
          ) : (
            <LanguageToggle />
          )}

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

          {!isHome ? (
            <>
              <button
                type="button"
                onClick={() =>
                  openLead?.({
                    action: "general-shortlist",
                    shopperIntent: "Get my shortlist",
                  })
                }
                className={`hidden sm:inline-flex ${btnSecondarySm}`}
              >
                {headerShortlist.label}
              </button>

              {isInventory ? (
                <Link href={discoveryHref} className={btnPrimarySm}>
                  {discoveryPrimary.label}
                </Link>
              ) : (
                <>
                  <Link href={browseHref} className={`hidden sm:inline-flex ${btnSecondarySm}`}>
                    {discoveryBrowse.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => scrollToId("guided-discovery")}
                    className={btnPrimarySm}
                  >
                    {discoveryPrimary.label}
                  </button>
                </>
              )}
            </>
          ) : null}

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


